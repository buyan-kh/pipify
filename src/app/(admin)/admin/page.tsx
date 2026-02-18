export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { UserPnLSummary, PlatformSummary } from "@/lib/types";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: users } = await supabase.rpc("get_all_users_pnl");
  const allUsers = (users ?? []) as UserPnLSummary[];

  const { data: summaryData } = await supabase.rpc("get_platform_summary");
  const summary = (summaryData ?? {}) as PlatformSummary;

  const totalSignals = summary.total_signals || 0;
  const executedSignals = summary.executed_signals || 0;
  const signalSuccessRate =
    totalSignals > 0 ? (executedSignals / totalSignals) * 100 : 0;

  const netFlow =
    Number(summary.total_deposits || 0) -
    Number(summary.total_withdrawals || 0);

  const fmt = (n: number) =>
    Math.abs(n).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Platform Dashboard
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          SaaS-wide metrics and user management
        </p>
      </div>

      {/* Row 1: Core metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div
          className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-blue shadow-sm animate-card-in"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
              Total Users
            </p>
            <span className="w-8 h-8 rounded-lg bg-[var(--color-primary-subtle)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-bold tabular">{summary.total_users || 0}</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">Registered accounts</p>
        </div>

        <div
          className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-green shadow-sm animate-card-in"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
              Active MT5
            </p>
            <span className="w-8 h-8 rounded-lg bg-[var(--color-success-subtle)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-bold tabular">{summary.active_mt5_accounts || 0}</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">Connected brokers</p>
        </div>

        <div
          className="bg-white rounded-xl border border-[var(--color-border)] p-5 shadow-sm animate-card-in"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
              Platform P&L
            </p>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${Number(summary.platform_net_pnl) >= 0 ? "bg-[var(--color-success-subtle)]" : "bg-[var(--color-danger-subtle)]"}`}>
              <svg className={`w-4 h-4 ${Number(summary.platform_net_pnl) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </span>
          </div>
          <p className={`text-2xl font-bold tabular ${Number(summary.platform_net_pnl) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
            {Number(summary.platform_net_pnl || 0) >= 0 ? "+" : "-"}${fmt(Number(summary.platform_net_pnl || 0))}
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1">All users combined</p>
        </div>

        <div
          className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-purple shadow-sm animate-card-in"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
              Total Trades
            </p>
            <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-bold tabular">{summary.total_trades || 0}</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            {summary.open_trades || 0} currently open
          </p>
        </div>
      </div>

      {/* Row 2: Financial metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-green shadow-sm animate-card-in"
          style={{ animationDelay: "240ms" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
            Total Deposits
          </p>
          <p className="text-2xl font-bold text-[var(--color-success)] tabular">
            +${fmt(Number(summary.total_deposits || 0))}
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1">Inflows recorded</p>
        </div>

        <div
          className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-red shadow-sm animate-card-in"
          style={{ animationDelay: "300ms" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
            Total Withdrawals
          </p>
          <p className="text-2xl font-bold text-[var(--color-danger)] tabular">
            -${fmt(Number(summary.total_withdrawals || 0))}
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1">Outflows recorded</p>
        </div>

        <div
          className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-amber shadow-sm animate-card-in"
          style={{ animationDelay: "360ms" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
            Signal Success
          </p>
          <p className="text-2xl font-bold tabular">
            {signalSuccessRate.toFixed(1)}%
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            {executedSignals} of {totalSignals} executed
          </p>
        </div>

        <div
          className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-slate shadow-sm animate-card-in"
          style={{ animationDelay: "420ms" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3">
            Net Flow
          </p>
          <p className={`text-2xl font-bold tabular ${netFlow >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
            {netFlow >= 0 ? "+" : "-"}${fmt(netFlow)}
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1">Deposits - Withdrawals</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-4">
          All Users
        </h2>
        <div
          className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm animate-card-in"
          style={{ animationDelay: "480ms" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                    User
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                    Trades
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                    Open
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                    Profit
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                    Commission
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                    Net P&L
                  </th>
                  <th className="text-left px-4 py-3 bg-slate-50/80" />
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr
                    key={u.user_id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-slate-50/60 group"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-[var(--color-foreground)]">
                          {u.full_name || "\u2014"}
                        </p>
                        <p className="text-xs text-[var(--color-muted)]">
                          {u.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular">
                      {u.total_trades}
                    </td>
                    <td className="px-4 py-3 text-right tabular">
                      {u.open_trades}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium tabular ${Number(u.total_profit) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
                    >
                      {Number(u.total_profit) >= 0 ? "+" : ""}${Number(u.total_profit).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right tabular text-[var(--color-muted)]">
                      ${Number(u.total_commission).toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold tabular ${Number(u.net_profit) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
                    >
                      {Number(u.net_profit) >= 0 ? "+" : ""}${Number(u.net_profit).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.user_id}`}
                        className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline text-sm font-medium opacity-60 group-hover:opacity-100"
                      >
                        View
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
                {allUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-[var(--color-muted)]"
                    >
                      <p className="font-medium text-[var(--color-foreground)]">No users yet</p>
                      <p className="text-xs mt-1">Users will appear here after they sign up</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
