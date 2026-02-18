import { createClient } from "@/lib/supabase/server";
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
  const { provider_id } = body;

  if (!provider_id) {
    return NextResponse.json(
      { error: "provider_id is required" },
      { status: 400 }
    );
  }

  // Check provider exists and user isn't following themselves
  const { data: provider } = await supabase
    .from("signal_providers")
    .select("user_id")
    .eq("id", provider_id)
    .single();

  if (!provider) {
    return NextResponse.json(
      { error: "Provider not found" },
      { status: 404 }
    );
  }

  if (provider.user_id === user.id) {
    return NextResponse.json(
      { error: "Cannot follow yourself" },
      { status: 400 }
    );
  }

  // Upsert: reactivate if previously unfollowed, or insert new
  const { data, error } = await supabase
    .from("provider_followers")
    .upsert(
      {
        provider_id,
        follower_id: user.id,
        is_active: true,
      },
      { onConflict: "provider_id,follower_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { provider_id } = body;

  if (!provider_id) {
    return NextResponse.json(
      { error: "provider_id is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("provider_followers")
    .update({ is_active: false })
    .eq("provider_id", provider_id)
    .eq("follower_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
