export type UserRole = "user" | "admin";
export type SignalStatus = "pending" | "processing" | "executed" | "failed";
export type TradeAction = "buy" | "sell" | "close_buy" | "close_sell" | "close_all";
export type TradeStatus = "open" | "closed" | "failed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface MT5Account {
  id: string;
  user_id: string;
  account_name: string;
  server: string;
  login: number;
  encrypted_password: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookKey {
  id: string;
  user_id: string;
  key: string;
  label: string;
  is_active: boolean;
  created_at: string;
}

export interface Signal {
  id: string;
  user_id: string;
  webhook_key_id: string;
  mt5_account_id: string | null;
  symbol: string;
  action: TradeAction;
  volume: number;
  price: number | null;
  sl: number | null;
  tp: number | null;
  status: SignalStatus;
  raw_payload: Record<string, unknown>;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface Trade {
  id: string;
  user_id: string;
  signal_id: string | null;
  mt5_account_id: string;
  ticket: number;
  symbol: string;
  action: TradeAction;
  volume: number;
  open_price: number;
  close_price: number | null;
  profit: number | null;
  commission: number | null;
  swap: number | null;
  status: TradeStatus;
  opened_at: string;
  closed_at: string | null;
  created_at: string;
}

export interface UserPnLSummary {
  user_id: string;
  email: string;
  full_name: string | null;
  total_trades: number;
  open_trades: number;
  total_profit: number;
  total_commission: number;
  total_swap: number;
  net_profit: number;
}

export type TransactionType = "deposit" | "withdrawal";

export interface Transaction {
  id: string;
  user_id: string;
  mt5_account_id: string | null;
  type: TransactionType;
  amount: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export type RiskLevel = "low" | "medium" | "high";

export interface SignalProvider {
  id: string;
  user_id: string;
  description: string | null;
  risk_level: RiskLevel;
  min_deposit: number;
  fee_percentage: number;
  is_public: boolean;
  created_at: string;
}

export interface ProviderFollower {
  id: string;
  provider_id: string;
  follower_id: string;
  is_active: boolean;
  created_at: string;
}

export interface ProviderStats {
  id: string;
  user_id: string;
  description: string | null;
  risk_level: RiskLevel;
  min_deposit: number;
  fee_percentage: number;
  is_public: boolean;
  created_at: string;
  full_name: string | null;
  email: string;
  win_rate: number;
  monthly_return: number;
  total_profit: number;
  total_trades: number;
  trades_per_day: number;
  follower_count: number;
}

export interface PlatformSummary {
  total_users: number;
  active_mt5_accounts: number;
  total_trades: number;
  open_trades: number;
  platform_net_pnl: number;
  total_signals: number;
  executed_signals: number;
  failed_signals: number;
  total_deposits: number;
  total_withdrawals: number;
}
