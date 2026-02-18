export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { PnLCard } from "@/components/pnl-card";
import { TradeTable } from "@/components/trade-table";
import type { Trade } from "@/lib/types";

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const allTrades = (trades ?? []) as Trade[];

  const closedTrades = allTrades.filter((t) => t.status === "closed");
  const openTrades = allTrades.filter((t) => t.status === "open");

  const portfolioValue = closedTrades.reduce(
    (sum, t) =>
      sum +
      (Number(t.profit) || 0) +
      (Number(t.commission) || 0) +
      (Number(t.swap) || 0),
    0
  );

  const totalPnL = allTrades.reduce(
    (sum, t) => sum + (Number(t.profit) || 0),
    0
  );

  const profitableTrades = closedTrades.filter(
    (t) => t.profit !== null && Number(t.profit) > 0
  );
  const losingTrades = closedTrades.filter(
    (t) => t.profit !== null && Number(t.profit) < 0
  );
  const breakEvenTrades = closedTrades.filter(
    (t) => t.profit !== null && Number(t.profit) === 0
  );

  const winRate =
    closedTrades.length > 0
      ? (profitableTrades.length / closedTrades.length) * 100
      : 0;

  const totalWinnings = profitableTrades.reduce(
    (sum, t) => sum + (Number(t.profit) || 0),
    0
  );
  const totalLosses = Math.abs(
    losingTrades.reduce((sum, t) => sum + (Number(t.profit) || 0), 0)
  );
  const profitFactor =
    totalLosses > 0
      ? totalWinnings / totalLosses
      : totalWinnings > 0
        ? Infinity
        : 0;

  const avgWin =
    profitableTrades.length > 0
      ? totalWinnings / profitableTrades.length
      : 0;
  const avgLoss =
    losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

  // Top traded symbols
  const symbolMap = new Map<string, { count: number; pnl: number }>();
  for (const t of allTrades) {
    const existing = symbolMap.get(t.symbol) || { count: 0, pnl: 0 };
    existing.count += 1;
    existing.pnl += Number(t.profit) || 0;
    symbolMap.set(t.symbol, existing);
  }
  const topSymbols = [...symbolMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const winBarPct =
    closedTrades.length > 0
      ? (profitableTrades.length / closedTrades.length) * 100
      : 0;
  const lossPct =
    closedTrades.length > 0
      ? (losingTrades.length / closedTrades.length) * 100
      : 0;
  const evenPct =
    closedTrades.length > 0
      ? (breakEvenTrades.length / closedTrades.length) * 100
      : 0;

  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Your trading performance at a glance
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <PnLCard
          title="Portfolio Value"
          value={`$${fmt(portfolioValue)}`}
          trend={
            portfolioValue > 0
              ? "up"
              : portfolioValue < 0
                ? "down"
                : "neutral"
          }
          subtitle={`From ${closedTrades.length} closed trade${closedTrades.length !== 1 ? "s" : ""}`}
          accent="blue"
          delay={0}
        />
        <PnLCard
          title="Total P&L"
          value={`${totalPnL >= 0 ? "+" : ""}$${fmt(totalPnL)}`}
          trend={totalPnL > 0 ? "up" : totalPnL < 0 ? "down" : "neutral"}
          subtitle={`Across ${allTrades.length} total trade${allTrades.length !== 1 ? "s" : ""}`}
          accent="green"
          delay={60}
        />
        <PnLCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          trend={winRate >= 50 ? "up" : winRate > 0 ? "down" : "neutral"}
          subtitle={`${profitableTrades.length}W \u00b7 ${losingTrades.length}L`}
          accent="amber"
          delay={120}
        />
        <PnLCard
          title="Open Positions"
          value={openTrades.length}
          subtitle={
            openTrades.length > 0
              ? `${openTrades.reduce((s, t) => s + Number(t.volume), 0).toFixed(2)} lots active`
              : "No active trades"
          }
          accent="purple"
          delay={180}
        />
      </div>

      {/* Performance + Top Symbols */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Trade Performance */}
        <div
          className="lg:col-span-2 bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm animate-card-in"
          style={{ animationDelay: "200ms" }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-5">
            Trade Performance
          </h2>

          {closedTrades.length > 0 ? (
            <>
              {/* Win/Loss bar */}
              <div className="mb-6">
                <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100">
                  {winBarPct > 0 && (
                    <div
                      className="bg-[var(--color-success)] rounded-l-full"
                      style={{ width: `${winBarPct}%` }}
                    />
                  )}
                  {evenPct > 0 && (
                    <div
                      className="bg-slate-300"
                      style={{ width: `${evenPct}%` }}
                    />
                  )}
                  {lossPct > 0 && (
                    <div
                      className="bg-[var(--color-danger)] rounded-r-full"
                      style={{ width: `${lossPct}%` }}
                    />
                  )}
                </div>
                <div className="flex justify-between mt-2.5 text-xs">
                  <span className="flex items-center gap-1.5 text-[var(--color-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                    {profitableTrades.length} Won ({winBarPct.toFixed(0)}%)
                  </span>
                  {breakEvenTrades.length > 0 && (
                    <span className="flex items-center gap-1.5 text-[var(--color-muted)]">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      {breakEvenTrades.length} Even
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-[var(--color-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
                    {losingTrades.length} Lost ({lossPct.toFixed(0)}%)
                  </span>
                </div>
              </div>

              {/* Stat pills */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg bg-[var(--color-success-subtle)] border border-emerald-100 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-success)] mb-0.5">
                    Avg Win
                  </p>
                  <p className="text-sm font-bold text-[var(--color-success)] tabular">
                    +${avgWin.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--color-danger-subtle)] border border-red-100 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-danger)] mb-0.5">
                    Avg Loss
                  </p>
                  <p className="text-sm font-bold text-[var(--color-danger)] tabular">
                    -${avgLoss.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-0.5">
                    Profit Factor
                  </p>
                  <p className="text-sm font-bold text-[var(--color-foreground)] tabular">
                    {profitFactor === Infinity
                      ? "\u221e"
                      : profitFactor.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-0.5">
                    Total Volume
                  </p>
                  <p className="text-sm font-bold text-[var(--color-foreground)] tabular">
                    {allTrades
                      .reduce((s, t) => s + Number(t.volume), 0)
                      .toFixed(2)}{" "}
                    lots
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[var(--color-border)] flex items-center justify-center mx-auto mb-3">
                <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                No closed trades yet
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Performance stats will appear after your first completed trade
              </p>
            </div>
          )}
        </div>

        {/* Top Symbols */}
        <div
          className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm animate-card-in"
          style={{ animationDelay: "260ms" }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-5">
            Top Symbols
          </h2>

          {topSymbols.length > 0 ? (
            <div className="space-y-2.5">
              {topSymbols.map(([symbol, data], i) => {
                const maxCount = topSymbols[0][1].count;
                const barWidth =
                  maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                return (
                  <div key={symbol} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-slate-50 border border-[var(--color-border)] flex items-center justify-center text-[10px] font-bold text-[var(--color-foreground)] uppercase">
                          {symbol.slice(0, 2)}
                        </span>
                        <div>
                          <p className="text-sm font-semibold leading-tight">
                            {symbol}
                          </p>
                          <p className="text-[11px] text-[var(--color-muted)]">
                            {data.count} trade{data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold tabular ${
                          data.pnl >= 0
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-danger)]"
                        }`}
                      >
                        {data.pnl >= 0 ? "+" : ""}${data.pnl.toFixed(2)}
                      </span>
                    </div>
                    {/* Volume bar */}
                    <div className="h-1 rounded-full bg-slate-100 ml-[42px]">
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)] opacity-30"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--color-muted)]">
                No trades yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-4">
          Recent Trades
        </h2>
        <TradeTable trades={allTrades.slice(0, 10)} />
      </div>
    </div>
  );
}
