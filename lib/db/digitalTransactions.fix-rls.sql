-- FIX RLS Policy Issue untuk Digital Transactions
-- Jalankan script ini di Supabase SQL Editor untuk update RLS policies

-- Step 1: Drop existing policies (jika sudah ada)
DROP POLICY IF EXISTS "Users can view their own digital transactions" ON digital_transactions;
DROP POLICY IF EXISTS "Users can insert their own digital transactions" ON digital_transactions;
DROP POLICY IF EXISTS "Users can update their own digital transactions" ON digital_transactions;
DROP POLICY IF EXISTS "Users can delete their own digital transactions" ON digital_transactions;

-- Step 2: Create new policies with proper configuration
-- Users can only view their own transactions
CREATE POLICY "Users can view their own digital transactions"
  ON digital_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert their own digital transactions"
  ON digital_transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own transactions
CREATE POLICY "Users can update their own digital transactions"
  ON digital_transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own transactions
CREATE POLICY "Users can delete their own digital transactions"
  ON digital_transactions FOR DELETE
  USING (auth.uid() = user_id);
