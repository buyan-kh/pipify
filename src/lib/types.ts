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
