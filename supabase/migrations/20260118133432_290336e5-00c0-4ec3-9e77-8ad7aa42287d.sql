-- Add internal authorization check to reserve_credit_for_generation function
-- This prevents privilege escalation by ensuring users can only modify their own credits

CREATE OR REPLACE FUNCTION public.reserve_credit_for_generation(p_user_id uuid)
 RETURNS TABLE(success boolean, remaining_credits integer, has_subscription boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_credits INTEGER;
  v_subscription TEXT;
BEGIN
  -- CRITICAL: Verify caller is modifying their own account (defense-in-depth)
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify another user''s credits';
  END IF;

  -- Lock row and check in single atomic operation
  SELECT credits, subscription_status 
  INTO v_credits, v_subscription
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE; -- Row-level lock prevents concurrent modifications
  
  -- Check if user has active subscription (no credit deduction needed)
  IF v_subscription = 'active' THEN
    RETURN QUERY SELECT true, v_credits, true;
    RETURN;
  END IF;
  
  -- Check if user has sufficient credits
  IF v_credits <= 0 THEN
    RETURN QUERY SELECT false, v_credits, false;
    RETURN;
  END IF;
  
  -- Deduct credit atomically
  UPDATE profiles
  SET credits = credits - 1, updated_at = now()
  WHERE id = p_user_id;
  
  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -1, 'generation', 'Comic generation');
  
  RETURN QUERY SELECT true, v_credits - 1, false;
END;
$function$;