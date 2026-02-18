-- Transaction type enum
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal');

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mt5_account_id UUID REFERENCES mt5_accounts(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount NUMERIC(20, 4) NOT NULL,
  note TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all transactions" ON transactions
  FOR ALL USING (is_admin());

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Platform summary RPC for admin dashboard
CREATE OR REPLACE FUNCTION get_platform_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_mt5_accounts', (SELECT COUNT(*) FROM mt5_accounts WHERE is_active = true),
    'total_trades', (SELECT COUNT(*) FROM trades),
    'open_trades', (SELECT COUNT(*) FROM trades WHERE status = 'open'),
    'platform_net_pnl', (SELECT COALESCE(SUM(profit) + SUM(COALESCE(commission, 0)) + SUM(COALESCE(swap, 0)), 0) FROM trades),
    'total_signals', (SELECT COUNT(*) FROM signals),
    'executed_signals', (SELECT COUNT(*) FROM signals WHERE status = 'executed'),
    'failed_signals', (SELECT COUNT(*) FROM signals WHERE status = 'failed'),
    'total_deposits', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'deposit'),
    'total_withdrawals', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'withdrawal')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
