-- Remove the INSERT policy that allows users to insert their own credit transactions
-- This is a security vulnerability as users could fraudulently grant themselves credits
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.credit_transactions;