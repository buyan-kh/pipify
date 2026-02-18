import type { Trade } from "@/lib/types";

interface TradeTableProps {
  trades: Trade[];
  showUser?: boolean;
}

export function TradeTable({ trades, showUser }: TradeTableProps) {
  if (trades.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center animate-card-in">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-[var(--color-border)] flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--color-foreground)]">No trades yet</p>
        <p className="text-xs text-[var(--color-muted)] mt-1">Trades will appear here once executed</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden animate-card-in shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {showUser && (
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                  User
                </th>
              )}
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                Ticket
              </th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                Symbol
              </th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                Action
              </th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                Volume
              </th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                Open
              </th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                Close
              </th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                Profit
              </th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                Status
              </th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr
                key={trade.id}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-slate-50/60 group"
              >
                {showUser && (
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {trade.user_id.slice(0, 8)}
                  </td>
                )}
                <td className="px-4 py-3 font-mono text-xs tabular">
                  {trade.ticket}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-[var(--color-foreground)]">
                    {trade.symbol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide ${
                      trade.action === "buy"
                        ? "bg-[var(--color-success-subtle)] text-[var(--color-success)]"
                        : trade.action === "sell"
                          ? "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {trade.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs tabular">
                  {trade.volume}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs tabular">
                  {Number(trade.open_price).toFixed(5)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs tabular">
                  {trade.close_price
                    ? Number(trade.close_price).toFixed(5)
                    : "\u2014"}
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold tabular ${
                    trade.profit !== null && trade.profit > 0
                      ? "text-[var(--color-success)]"
                      : trade.profit !== null && trade.profit < 0
                        ? "text-[var(--color-danger)]"
                        : "text-[var(--color-muted)]"
                  }`}
                >
                  {trade.profit !== null
                    ? `${Number(trade.profit) >= 0 ? "+" : ""}$${Number(trade.profit).toFixed(2)}`
                    : "\u2014"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      trade.status === "open"
                        ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"
                        : trade.status === "closed"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]"
                    }`}
                  >
                    {trade.status === "open" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                    )}
                    {trade.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--color-muted)] tabular">
                  {new Date(trade.opened_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
