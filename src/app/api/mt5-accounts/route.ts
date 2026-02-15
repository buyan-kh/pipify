import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { account_name, server, login, password } = body;

  if (!server || !login || !password) {
    return NextResponse.json(
      { error: "Server, login, and password are required" },
      { status: 400 }
    );
  }

  const encryptedPassword = await encrypt(password);
  const admin = createAdminClient();

  const { data, error } = await admin.from("mt5_accounts").insert({
    user_id: user.id,
    account_name: account_name || "Default",
    server,
    login,
    encrypted_password: encryptedPassword,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, account_name, server, login, password } = body;

  if (!id) {
    return NextResponse.json({ error: "Account ID required" }, { status: 400 });
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("mt5_accounts")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (account_name) updates.account_name = account_name;
  if (server) updates.server = server;
  if (login) updates.login = login;
  if (password) updates.encrypted_password = await encrypt(password);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("mt5_accounts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
