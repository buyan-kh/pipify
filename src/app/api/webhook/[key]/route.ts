import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type TradeAction = "buy" | "sell" | "close_buy" | "close_sell" | "close_all";
const VALID_ACTIONS: TradeAction[] = [
  "buy",
  "sell",
  "close_buy",
  "close_sell",
  "close_all",
];

function parseTextPayload(text: string) {
  // Format: "EURUSD buy 0.1" or "EURUSD sell 0.1 sl=1.0800 tp=1.1000"
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const symbol = parts[0].toUpperCase();
  const action = parts[1].toLowerCase() as TradeAction;
  const volume = parts[2] ? parseFloat(parts[2]) : 0.01;

  if (!VALID_ACTIONS.includes(action)) return null;

  let sl: number | null = null;
  let tp: number | null = null;
  for (let i = 3; i < parts.length; i++) {
    const [k, v] = parts[i].split("=");
    if (k === "sl") sl = parseFloat(v);
    if (k === "tp") tp = parseFloat(v);
  }

  return { symbol, action, volume, sl, tp };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const admin = createAdminClient();

  // Validate webhook key
  const { data: webhookKey } = await admin
    .from("webhook_keys")
    .select("id, user_id, is_active")
    .eq("key", key)
    .single();

  if (!webhookKey) {
    return NextResponse.json({ error: "Invalid webhook key" }, { status: 404 });
  }

  if (!webhookKey.is_active) {
    return NextResponse.json(
      { error: "Webhook key is disabled" },
      { status: 403 }
    );
  }

  // Parse payload (JSON or text)
  let signal: {
    symbol: string;
    action: TradeAction;
    volume: number;
    sl?: number | null;
    tp?: number | null;
    mt5_account_id?: string;
  };
  let rawPayload: Record<string, unknown>;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    rawPayload = body;

    const action = (body.action || "").toLowerCase();
    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        {
          error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    signal = {
      symbol: (body.symbol || "").toUpperCase(),
      action,
      volume: parseFloat(body.volume) || 0.01,
      sl: body.sl ? parseFloat(body.sl) : null,
      tp: body.tp ? parseFloat(body.tp) : null,
      mt5_account_id: body.mt5_account_id || undefined,
    };
  } else {
    const text = await request.text();
    rawPayload = { raw_text: text };
    const parsed = parseTextPayload(text);
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            'Invalid text format. Use: "SYMBOL action volume" (e.g., "EURUSD buy 0.1")',
        },
        { status: 400 }
      );
    }
    signal = parsed;
  }

  if (!signal.symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  // If no specific MT5 account, use the user's first active account
  let mt5AccountId = signal.mt5_account_id || null;
  if (!mt5AccountId) {
    const { data: account } = await admin
      .from("mt5_accounts")
      .select("id")
      .eq("user_id", webhookKey.user_id)
      .eq("is_active", true)
      .limit(1)
      .single();

    mt5AccountId = account?.id || null;
  }

  // Insert signal
  const { data: insertedSignal, error } = await admin
    .from("signals")
    .insert({
      user_id: webhookKey.user_id,
      webhook_key_id: webhookKey.id,
      mt5_account_id: mt5AccountId,
      symbol: signal.symbol,
      action: signal.action,
      volume: signal.volume,
      sl: signal.sl,
      tp: signal.tp,
      status: "pending",
      raw_payload: rawPayload,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    signal_id: insertedSignal.id,
    status: "pending",
  });
}
