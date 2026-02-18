export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { StatCards } from "@/components/journal/stat-cards";
import { TradeCalendar } from "@/components/journal/trade-calendar";
import { TradeLogTable } from "@/components/journal/trade-log-table";
import type { Trade } from "@/lib/types";

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user!.id)
    .order("opened_at", { ascending: false });

  const allTrades = (trades ?? []) as Trade[];
  const closedTrades = allTrades.filter((t) => t.status === "closed");

  const profitableTrades = closedTrades.filter(
    (t) => t.profit !== null && Number(t.profit) > 0
  );
  const losingTrades = closedTrades.filter(
    (t) => t.profit !== null && Number(t.profit) < 0
  );
  const breakEvenTrades = closedTrades.filter(
    (t) => t.profit !== null && Number(t.profit) === 0
  );

  const totalPnL = closedTrades.reduce(
    (sum, t) => sum + (Number(t.profit) || 0),
    0
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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
          Trade Journal
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Analyze your trading performance and track daily results
        </p>
      </div>

      {/* Stat Cards */}
      <StatCards
        closedTrades={closedTrades}
        totalPnL={totalPnL}
        winRate={winRate}
        profitFactor={profitFactor}
        avgWin={avgWin}
        avgLoss={avgLoss}
        winCount={profitableTrades.length}
        lossCount={losingTrades.length}
        breakEvenCount={breakEvenTrades.length}
      />

      {/* Calendar Heatmap */}
      <TradeCalendar trades={allTrades} />

      {/* Trade Log */}
      <div className="mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-4">
          Trade Log
        </h2>
        <TradeLogTable trades={allTrades} />
      </div>
    </div>
  );
}
