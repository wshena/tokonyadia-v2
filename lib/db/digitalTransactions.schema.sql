-- Create digital_transactions table
CREATE TABLE IF NOT EXISTS digital_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('topup', 'tagihan')),
  service_label VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  nominal_label VARCHAR(255),
  payment_method VARCHAR(50),
  field_values JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  transaction_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_digital_transactions_user_id ON digital_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_transactions_category ON digital_transactions(category);
CREATE INDEX IF NOT EXISTS idx_digital_transactions_created_at ON digital_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_transactions_user_created ON digital_transactions(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE digital_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own digital transactions" ON digital_transactions;
DROP POLICY IF EXISTS "Users can insert their own digital transactions" ON digital_transactions;
DROP POLICY IF EXISTS "Users can update their own digital transactions" ON digital_transactions;
DROP POLICY IF EXISTS "Users can delete their own digital transactions" ON digital_transactions;

-- Create policies for authenticated users
-- Users can only view their own transactions
CREATE POLICY "Users can view their own digital transactions"
  ON digital_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions (simplified - just check user_id matches)
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
