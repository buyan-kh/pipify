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
    .order("created_at", { ascending: false })
    .limit(20);

  const allTrades = (trades ?? []) as Trade[];
  const totalProfit = allTrades.reduce(
    (sum, t) => sum + (Number(t.profit) || 0),
    0
  );
  const openTrades = allTrades.filter((t) => t.status === "open");
  const totalTrades = allTrades.length;

  const { count: signalCount } = await supabase
    .from("signals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <PnLCard
          title="Total Profit"
          value={`$${totalProfit.toFixed(2)}`}
          trend={totalProfit > 0 ? "up" : totalProfit < 0 ? "down" : "neutral"}
        />
        <PnLCard title="Total Trades" value={totalTrades} />
        <PnLCard title="Open Positions" value={openTrades.length} />
        <PnLCard title="Total Signals" value={signalCount ?? 0} />
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Trades</h2>
      <TradeTable trades={allTrades.slice(0, 10)} />
    </div>
  );
}
