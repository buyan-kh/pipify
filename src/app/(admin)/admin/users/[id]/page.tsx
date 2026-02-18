export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { TradeTable } from "@/components/trade-table";
import { PnLCard } from "@/components/pnl-card";
import { TransactionForm } from "./transaction-form";
import { ProviderForm } from "./provider-form";
import type {
  Trade,
  Profile,
  MT5Account,
  Signal,
  WebhookKey,
  Transaction,
  SignalProvider,
} from "@/lib/types";
import Link from "next/link";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  const { data: accounts } = await supabase
    .from("mt5_accounts")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const { data: signals } = await supabase
    .from("signals")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const { data: webhookKeys } = await supabase
    .from("webhook_keys")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const { data: providerData } = await supabase
    .from("signal_providers")
    .select("*")
    .eq("user_id", id)
    .single();

  const signalProvider = (providerData as SignalProvider) || null;

  const user = profile as Profile | null;
  const userAccounts = (accounts ?? []) as MT5Account[];
  const userSignals = (signals ?? []) as Signal[];
  const userTrades = (trades ?? []) as Trade[];
  const userWebhookKeys = (webhookKeys ?? []) as WebhookKey[];
  const userTransactions = (transactions ?? []) as Transaction[];

  const totalProfit = userTrades.reduce(
    (sum, t) => sum + (Number(t.profit) || 0),
    0
  );
  const openTrades = userTrades.filter((t) => t.status === "open");

  const totalDeposits = userTransactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalWithdrawals = userTransactions
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const webhookBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";

  if (!user) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Link
          href="/admin"
          className="text-[var(--color-primary)] hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="w-9 h-9 rounded-lg border border-[var(--color-border)] bg-white flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-slate-300 shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.full_name || user.email}
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            {user.email} &middot; Joined{" "}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <PnLCard
          title="Net Profit"
          value={`${totalProfit >= 0 ? "+" : ""}$${totalProfit.toFixed(2)}`}
          trend={
            totalProfit > 0 ? "up" : totalProfit < 0 ? "down" : "neutral"
          }
          accent="green"
          delay={0}
        />
        <PnLCard
          title="Total Trades"
          value={userTrades.length}
          accent="blue"
          delay={60}
        />
        <PnLCard
          title="Open Positions"
          value={openTrades.length}
          accent="purple"
          delay={120}
        />
        <PnLCard
          title="MT5 Accounts"
          value={userAccounts.length}
          accent="slate"
          delay={180}
        />
      </div>

      {/* Signal Provider */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
        Signal Provider
      </h2>
      <div className="mb-8">
        <ProviderForm userId={id} provider={signalProvider} />
      </div>

      {/* Webhook Keys */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
        Webhook Keys
      </h2>
      <div className="space-y-2 mb-8">
        {userWebhookKeys.length === 0 ? (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 text-center shadow-sm">
            <p className="text-sm text-[var(--color-muted)]">No webhook keys</p>
          </div>
        ) : (
          userWebhookKeys.map((wk) => (
            <div
              key={wk.id}
              className="bg-white rounded-xl border border-[var(--color-border)] p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{wk.label}</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      wk.is_active
                        ? "bg-[var(--color-success-subtle)] text-[var(--color-success)]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {wk.is_active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                    )}
                    {wk.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  {new Date(wk.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg border border-[var(--color-border)] px-3 py-2.5">
                <p className="text-xs font-mono text-[var(--color-muted)] break-all leading-relaxed">
                  {webhookBaseUrl}/api/webhook/{wk.key}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transactions */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
        Transactions
      </h2>

      {/* Quick summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 card-accent-green shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Total Deposits
          </p>
          <p className="text-lg font-bold text-[var(--color-success)] mt-1.5 tabular">
            +${totalDeposits.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 card-accent-red shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Total Withdrawals
          </p>
          <p className="text-lg font-bold text-[var(--color-danger)] mt-1.5 tabular">
            -${totalWithdrawals.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 card-accent-blue shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Net Balance
          </p>
          <p
            className={`text-lg font-bold mt-1.5 tabular ${totalDeposits - totalWithdrawals >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
          >
            {totalDeposits - totalWithdrawals >= 0 ? "+" : "-"}$
            {Math.abs(totalDeposits - totalWithdrawals).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add Transaction Form */}
      <TransactionForm userId={id} />

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden mb-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                  Type
                </th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                  Amount
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                  Note
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {userTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-slate-50/60"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide ${
                        tx.type === "deposit"
                          ? "bg-[var(--color-success-subtle)] text-[var(--color-success)]"
                          : "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold tabular ${
                      tx.type === "deposit"
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-danger)]"
                    }`}
                  >
                    {tx.type === "deposit" ? "+" : "-"}$
                    {Number(tx.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {tx.note || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted)] tabular">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {userTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      No transactions recorded
                    </p>
                    <p className="text-xs text-[var(--color-muted)] mt-1">
                      Use the form above to record a deposit or withdrawal
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MT5 Accounts */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
        MT5 Accounts
      </h2>
      <div className="space-y-2 mb-8">
        {userAccounts.length === 0 ? (
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 text-center shadow-sm">
            <p className="text-sm text-[var(--color-muted)]">No accounts</p>
          </div>
        ) : (
          userAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-xl border border-[var(--color-border)] p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-[var(--color-border)] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-[var(--color-muted)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">{acc.account_name}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {acc.server} &middot; {acc.login}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  acc.is_active
                    ? "bg-[var(--color-success-subtle)] text-[var(--color-success)]"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {acc.is_active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                )}
                {acc.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Recent Signals */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
        Recent Signals
      </h2>
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden mb-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                  Symbol
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                  Action
                </th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                  Volume
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                  Error
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {userSignals.map((sig) => (
                <tr
                  key={sig.id}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-slate-50/60"
                >
                  <td className="px-4 py-3 font-semibold">{sig.symbol}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide ${
                        sig.action === "buy"
                          ? "bg-[var(--color-success-subtle)] text-[var(--color-success)]"
                          : sig.action === "sell"
                            ? "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {sig.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular">
                    {sig.volume}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        sig.status === "executed"
                          ? "bg-[var(--color-success-subtle)] text-[var(--color-success)]"
                          : sig.status === "failed"
                            ? "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]"
                            : sig.status === "processing"
                              ? "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]"
                              : "bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"
                      }`}
                    >
                      {sig.status === "processing" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)] animate-pulse" />
                      )}
                      {sig.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-danger)] text-xs max-w-[200px] truncate">
                    {sig.error_message || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted)] tabular">
                    {new Date(sig.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {userSignals.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-[var(--color-foreground)]">No signals</p>
                    <p className="text-xs text-[var(--color-muted)] mt-1">Signals will appear when webhooks are triggered</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trades */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
        Trades
      </h2>
      <TradeTable trades={userTrades} />
    </div>
  );
}
