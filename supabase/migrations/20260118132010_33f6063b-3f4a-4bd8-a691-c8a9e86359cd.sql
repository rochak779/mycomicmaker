-- Create atomic credit deduction function to prevent race conditions
-- This function checks and deducts credits in a single atomic operation with row-level locking
CREATE OR REPLACE FUNCTION public.reserve_credit_for_generation(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, remaining_credits INTEGER, has_subscription BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credits INTEGER;
  v_subscription TEXT;
BEGIN
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
$$;