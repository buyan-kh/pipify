import type { Trade } from "@/lib/types";

interface TradeTableProps {
  trades: Trade[];
  showUser?: boolean;
}

export function TradeTable({ trades, showUser }: TradeTableProps) {
  if (trades.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 text-center text-[var(--color-muted)]">
        No trades yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-gray-50">
              {showUser && <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">User</th>}
              <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">Ticket</th>
              <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">Symbol</th>
              <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">Action</th>
              <th className="text-right px-4 py-3 font-medium text-[var(--color-muted)]">Volume</th>
              <th className="text-right px-4 py-3 font-medium text-[var(--color-muted)]">Open</th>
              <th className="text-right px-4 py-3 font-medium text-[var(--color-muted)]">Close</th>
              <th className="text-right px-4 py-3 font-medium text-[var(--color-muted)]">Profit</th>
              <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">Status</th>
              <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr
                key={trade.id}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50"
              >
                {showUser && <td className="px-4 py-3">{trade.user_id.slice(0, 8)}</td>}
                <td className="px-4 py-3 font-mono">{trade.ticket}</td>
                <td className="px-4 py-3 font-medium">{trade.symbol}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      trade.action === "buy"
                        ? "bg-green-100 text-green-700"
                        : trade.action === "sell"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {trade.action.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{trade.volume}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {Number(trade.open_price).toFixed(5)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {trade.close_price
                    ? Number(trade.close_price).toFixed(5)
                    : "—"}
                </td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    trade.profit !== null && trade.profit > 0
                      ? "text-[var(--color-success)]"
                      : trade.profit !== null && trade.profit < 0
                        ? "text-[var(--color-danger)]"
                        : ""
                  }`}
                >
                  {trade.profit !== null
                    ? `$${Number(trade.profit).toFixed(2)}`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      trade.status === "open"
                        ? "bg-blue-100 text-blue-700"
                        : trade.status === "closed"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {trade.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)]">
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
