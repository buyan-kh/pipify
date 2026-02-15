-- Enums
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE signal_status AS ENUM ('pending', 'processing', 'executed', 'failed');
CREATE TYPE trade_action AS ENUM ('buy', 'sell', 'close_buy', 'close_sell', 'close_all');
CREATE TYPE trade_status AS ENUM ('open', 'closed', 'failed');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MT5 Accounts
CREATE TABLE mt5_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL DEFAULT 'Default',
  server TEXT NOT NULL,
  login BIGINT NOT NULL,
  encrypted_password TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook Keys
CREATE TABLE webhook_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL DEFAULT 'Default',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Signals
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  webhook_key_id UUID NOT NULL REFERENCES webhook_keys(id) ON DELETE CASCADE,
  mt5_account_id UUID REFERENCES mt5_accounts(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL,
  action trade_action NOT NULL,
  volume NUMERIC(10, 4) NOT NULL DEFAULT 0.01,
  price NUMERIC(20, 8),
  sl NUMERIC(20, 8),
  tp NUMERIC(20, 8),
  status signal_status NOT NULL DEFAULT 'pending',
  raw_payload JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Trades
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
  mt5_account_id UUID NOT NULL REFERENCES mt5_accounts(id) ON DELETE CASCADE,
  ticket BIGINT NOT NULL,
  symbol TEXT NOT NULL,
  action trade_action NOT NULL,
  volume NUMERIC(10, 4) NOT NULL,
  open_price NUMERIC(20, 8) NOT NULL,
  close_price NUMERIC(20, 8),
  profit NUMERIC(20, 4),
  commission NUMERIC(20, 4),
  swap NUMERIC(20, 4),
  status trade_status NOT NULL DEFAULT 'open',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_mt5_accounts_user ON mt5_accounts(user_id);
CREATE INDEX idx_webhook_keys_key ON webhook_keys(key);
CREATE INDEX idx_webhook_keys_user ON webhook_keys(user_id);
CREATE INDEX idx_signals_status ON signals(status);
CREATE INDEX idx_signals_user ON signals(user_id);
CREATE INDEX idx_trades_user ON trades(user_id);
CREATE INDEX idx_trades_mt5_account ON trades(mt5_account_id);
CREATE INDEX idx_trades_status ON trades(status);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER mt5_accounts_updated_at
  BEFORE UPDATE ON mt5_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-create webhook key for new profile
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO webhook_keys (user_id, key, label)
  VALUES (NEW.id, encode(gen_random_bytes(24), 'hex'), 'Default');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- Admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Admin P&L summary function
CREATE OR REPLACE FUNCTION get_all_users_pnl()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  total_trades BIGINT,
  open_trades BIGINT,
  total_profit NUMERIC,
  total_commission NUMERIC,
  total_swap NUMERIC,
  net_profit NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS user_id,
    p.email,
    p.full_name,
    COUNT(t.id) AS total_trades,
    COUNT(t.id) FILTER (WHERE t.status = 'open') AS open_trades,
    COALESCE(SUM(t.profit), 0) AS total_profit,
    COALESCE(SUM(t.commission), 0) AS total_commission,
    COALESCE(SUM(t.swap), 0) AS total_swap,
    COALESCE(SUM(t.profit), 0) + COALESCE(SUM(t.commission), 0) + COALESCE(SUM(t.swap), 0) AS net_profit
  FROM profiles p
  LEFT JOIN trades t ON t.user_id = p.id
  GROUP BY p.id, p.email, p.full_name
  ORDER BY net_profit DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mt5_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own, admins see all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- MT5 Accounts: users manage own, admins see all
CREATE POLICY "Users can view own MT5 accounts" ON mt5_accounts
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can insert own MT5 accounts" ON mt5_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own MT5 accounts" ON mt5_accounts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own MT5 accounts" ON mt5_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Webhook Keys: users manage own, admins see all
CREATE POLICY "Users can view own webhook keys" ON webhook_keys
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can insert own webhook keys" ON webhook_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own webhook keys" ON webhook_keys
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own webhook keys" ON webhook_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Signals: users see own, admins see all
CREATE POLICY "Users can view own signals" ON signals
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can insert own signals" ON signals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trades: users see own, admins see all
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
