import type { Trade } from "@/lib/types";

interface TradeLogTableProps {
  trades: Trade[];
}

function formatDuration(openedAt: string, closedAt: string | null): string {
  if (!closedAt) return "\u2014";
  const ms = new Date(closedAt).getTime() - new Date(openedAt).getTime();
  if (ms < 0) return "\u2014";

  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `${totalMin}m`;

  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;

  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

function computePips(trade: Trade): string {
  if (!trade.close_price) return "\u2014";
  const diff = Math.abs(Number(trade.close_price) - Number(trade.open_price));
  // Forex pairs typically have 4/5 decimal places; indices/metals use 1
  const symbol = trade.symbol.toUpperCase();
  const isJPY = symbol.includes("JPY");
  const isIndex =
    symbol.includes("US30") ||
    symbol.includes("US500") ||
    symbol.includes("NAS") ||
    symbol.includes("DAX") ||
    symbol.includes("SPX") ||
    symbol.includes("XAU") ||
    symbol.includes("GOLD");

  let pips: number;
  if (isIndex) {
    pips = diff;
  } else if (isJPY) {
    pips = diff * 100;
  } else {
    pips = diff * 10000;
  }

  return pips.toFixed(1);
}

function computeROI(trade: Trade): string {
  if (trade.profit === null || trade.profit === undefined) return "\u2014";
  const notional = Number(trade.open_price) * Number(trade.volume);
  if (notional === 0) return "\u2014";
  const roi = (Number(trade.profit) / notional) * 100;
  return `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`;
}

export function TradeLogTable({ trades }: TradeLogTableProps) {
  if (trades.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center animate-card-in">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-[var(--color-border)] flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-5 h-5 text-[var(--color-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--color-foreground)]">
          No trades yet
        </p>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          Trades will appear here once executed
        </p>
      </div>
    );
  }

  const thClass =
    "text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80";
  const thRightClass =
    "text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-muted)] bg-slate-50/80";

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden animate-card-in shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className={thClass}>Date</th>
              <th className={thClass}>Symbol</th>
              <th className={thClass}>Status</th>
              <th className={thRightClass}>Net ROI</th>
              <th className={thRightClass}>Volume</th>
              <th className={thRightClass}>Pips</th>
              <th className={thClass}>Duration</th>
              <th className={thRightClass}>Profit</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const profit = Number(trade.profit) || 0;
              const isWin = trade.status === "closed" && profit > 0;
              const isLoss = trade.status === "closed" && profit < 0;
              const isOpen = trade.status === "open";

              return (
                <tr
                  key={trade.id}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-slate-50/60 group"
                >
                  <td className="px-4 py-3 text-xs text-[var(--color-muted)] tabular">
                    {new Date(trade.opened_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[var(--color-foreground)]">
                      {trade.symbol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isWin && (
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[var(--color-success-subtle)] text-[var(--color-success)]">
                        WIN
                      </span>
                    )}
                    {isLoss && (
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[var(--color-danger-subtle)] text-[var(--color-danger)]">
                        LOSS
                      </span>
                    )}
                    {isOpen && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                        OPEN
                      </span>
                    )}
                    {!isWin && !isLoss && !isOpen && (
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-500">
                        {trade.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular">
                    {computeROI(trade)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular">
                    {trade.volume}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular">
                    {computePips(trade)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted)] tabular">
                    {formatDuration(trade.opened_at, trade.closed_at)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold tabular ${
                      profit > 0
                        ? "text-[var(--color-success)]"
                        : profit < 0
                          ? "text-[var(--color-danger)]"
                          : "text-[var(--color-muted)]"
                    }`}
                  >
                    {trade.profit !== null
                      ? `${profit >= 0 ? "+" : ""}$${profit.toFixed(2)}`
                      : "\u2014"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
