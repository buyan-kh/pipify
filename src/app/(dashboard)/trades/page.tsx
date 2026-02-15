export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { TradeTable } from "@/components/trade-table";
import type { Trade } from "@/lib/types";

export default async function TradesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Trade History</h1>
      <TradeTable trades={(trades ?? []) as Trade[]} />
    </div>
  );
}
