import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { user_id, mt5_account_id, type, amount, note } = body;

  if (!user_id || !type || !amount) {
    return NextResponse.json(
      { error: "user_id, type, and amount are required" },
      { status: 400 }
    );
  }

  if (!["deposit", "withdrawal"].includes(type)) {
    return NextResponse.json(
      { error: "type must be deposit or withdrawal" },
      { status: 400 }
    );
  }

  if (Number(amount) <= 0) {
    return NextResponse.json(
      { error: "amount must be positive" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("transactions")
    .insert({
      user_id,
      mt5_account_id: mt5_account_id || null,
      type,
      amount: Number(amount),
      note: note || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
