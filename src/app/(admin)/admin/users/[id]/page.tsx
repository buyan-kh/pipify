export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { TradeTable } from "@/components/trade-table";
import { PnLCard } from "@/components/pnl-card";
import type { Trade, Profile, MT5Account, Signal } from "@/lib/types";
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

  const user = profile as Profile | null;
  const userAccounts = (accounts ?? []) as MT5Account[];
  const userSignals = (signals ?? []) as Signal[];
  const userTrades = (trades ?? []) as Trade[];

  const totalProfit = userTrades.reduce(
    (sum, t) => sum + (Number(t.profit) || 0),
    0
  );
  const openTrades = userTrades.filter((t) => t.status === "open");

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Link href="/admin" className="text-[var(--color-primary)] hover:underline">
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{user.full_name || user.email}</h1>
          <p className="text-sm text-[var(--color-muted)]">{user.email} &middot; Joined {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <PnLCard
          title="Net Profit"
          value={`$${totalProfit.toFixed(2)}`}
          trend={totalProfit > 0 ? "up" : totalProfit < 0 ? "down" : "neutral"}
        />
        <PnLCard title="Total Trades" value={userTrades.length} />
        <PnLCard title="Open Positions" value={openTrades.length} />
        <PnLCard title="MT5 Accounts" value={userAccounts.length} />
      </div>

      {/* MT5 Accounts */}
      <h2 className="text-lg font-semibold mb-3">MT5 Accounts</h2>
      <div className="space-y-2 mb-8">
        {userAccounts.length === 0 ? (
          <p className="text-[var(--color-muted)] text-sm">No accounts</p>
        ) : (
          userAccounts.map((acc) => (
            <div key={acc.id} className="bg-white rounded-lg border border-[var(--color-border)] p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{acc.account_name}</p>
                <p className="text-sm text-[var(--color-muted)]">{acc.server} &middot; {acc.login}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${acc.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {acc.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Recent Signals */}
      <h2 className="text-lg font-semibold mb-3">Recent Signals</h2>
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">Symbol</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">Action</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-muted)]">Volume</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">Error</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">Time</th>
              </tr>
            </thead>
            <tbody>
              {userSignals.map((sig) => (
                <tr key={sig.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{sig.symbol}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      sig.action === "buy" ? "bg-green-100 text-green-700" :
                      sig.action === "sell" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>{sig.action}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{sig.volume}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      sig.status === "executed" ? "bg-green-100 text-green-700" :
                      sig.status === "failed" ? "bg-red-100 text-red-700" :
                      sig.status === "processing" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{sig.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-danger)] text-xs max-w-[200px] truncate">
                    {sig.error_message || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {new Date(sig.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {userSignals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted)]">No signals</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trades */}
      <h2 className="text-lg font-semibold mb-3">Trades</h2>
      <TradeTable trades={userTrades} />
    </div>
  );
}
