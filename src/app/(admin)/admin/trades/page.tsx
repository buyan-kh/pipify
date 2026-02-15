export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { TradeTable } from "@/components/trade-table";
import type { Trade } from "@/lib/types";

export default async function AdminTradesPage() {
  const supabase = await createClient();

  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Trades</h1>
      <TradeTable trades={(trades ?? []) as Trade[]} showUser />
    </div>
  );
}
