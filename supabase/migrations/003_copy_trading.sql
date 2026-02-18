-- Risk level enum
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

-- Signal providers table
CREATE TABLE signal_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  description TEXT,
  risk_level risk_level NOT NULL DEFAULT 'medium',
  min_deposit NUMERIC(20, 4) NOT NULL DEFAULT 100,
  fee_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_signal_providers_user ON signal_providers(user_id);
CREATE INDEX idx_signal_providers_public ON signal_providers(is_public);

-- Provider followers table
CREATE TABLE provider_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES signal_providers(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, follower_id)
);

CREATE INDEX idx_provider_followers_provider ON provider_followers(provider_id);
CREATE INDEX idx_provider_followers_follower ON provider_followers(follower_id);

-- RLS
ALTER TABLE signal_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_followers ENABLE ROW LEVEL SECURITY;

-- Signal providers policies
CREATE POLICY "Anyone can view public providers" ON signal_providers
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all providers" ON signal_providers
  FOR ALL USING (is_admin());

-- Provider followers policies
CREATE POLICY "Users can view own follows" ON provider_followers
  FOR SELECT USING (auth.uid() = follower_id);

CREATE POLICY "Users can follow providers" ON provider_followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow providers" ON provider_followers
  FOR UPDATE USING (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows" ON provider_followers
  FOR DELETE USING (auth.uid() = follower_id);

CREATE POLICY "Admins can manage all follows" ON provider_followers
  FOR ALL USING (is_admin());

-- RPC to get provider stats for marketplace cards
CREATE OR REPLACE FUNCTION get_provider_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(provider_row) INTO result
  FROM (
    SELECT
      sp.id,
      sp.user_id,
      sp.description,
      sp.risk_level,
      sp.min_deposit,
      sp.fee_percentage,
      sp.is_public,
      sp.created_at,
      p.full_name,
      p.email,
      COALESCE(stats.win_rate, 0) AS win_rate,
      COALESCE(stats.monthly_return, 0) AS monthly_return,
      COALESCE(stats.total_profit, 0) AS total_profit,
      COALESCE(stats.total_trades, 0) AS total_trades,
      COALESCE(stats.trades_per_day, 0) AS trades_per_day,
      COALESCE(follower_counts.count, 0) AS follower_count
    FROM signal_providers sp
    JOIN profiles p ON p.id = sp.user_id
    LEFT JOIN LATERAL (
      SELECT
        CASE WHEN COUNT(*) > 0
          THEN ROUND((COUNT(*) FILTER (WHERE t.profit > 0)::NUMERIC / COUNT(*)::NUMERIC) * 100, 1)
          ELSE 0
        END AS win_rate,
        COALESCE(SUM(t.profit), 0) AS total_profit,
        COUNT(*) AS total_trades,
        CASE WHEN COUNT(*) > 0
          THEN ROUND(
            COALESCE(SUM(t.profit) FILTER (WHERE t.closed_at >= NOW() - INTERVAL '30 days'), 0)
            / GREATEST(NULLIF(
              (SELECT COALESCE(SUM(tx.amount), 1) FROM transactions tx WHERE tx.user_id = sp.user_id AND tx.type = 'deposit'),
            0), 1) * 100, 1)
          ELSE 0
        END AS monthly_return,
        CASE WHEN (NOW() - sp.created_at) > INTERVAL '1 day'
          THEN ROUND(COUNT(*)::NUMERIC / GREATEST(EXTRACT(EPOCH FROM (NOW() - sp.created_at)) / 86400, 1), 1)
          ELSE COUNT(*)::NUMERIC
        END AS trades_per_day
      FROM trades t
      WHERE t.user_id = sp.user_id AND t.status = 'closed'
    ) stats ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS count
      FROM provider_followers pf
      WHERE pf.provider_id = sp.id AND pf.is_active = true
    ) follower_counts ON true
    WHERE sp.is_public = true
    ORDER BY follower_counts.count DESC, stats.total_profit DESC
  ) provider_row;
  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
