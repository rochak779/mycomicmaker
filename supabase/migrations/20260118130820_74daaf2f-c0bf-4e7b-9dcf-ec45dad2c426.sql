-- Add unique constraint on stripe_payment_id to prevent duplicate payment processing
-- This provides database-level protection against replay attacks
ALTER TABLE public.credit_transactions 
ADD CONSTRAINT unique_stripe_payment_id 
UNIQUE (stripe_payment_id);