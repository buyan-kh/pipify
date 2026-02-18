export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { ProviderCard } from "@/components/provider-card";
import type { ProviderStats } from "@/lib/types";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch provider stats via RPC
  const { data: providers } = await supabase.rpc("get_provider_stats");
  const providerList = (providers ?? []) as ProviderStats[];

  // Fetch current user's follows
  let followedIds: Set<string> = new Set();
  if (user) {
    const { data: follows } = await supabase
      .from("provider_followers")
      .select("provider_id")
      .eq("follower_id", user.id)
      .eq("is_active", true);
    followedIds = new Set((follows ?? []).map((f: { provider_id: string }) => f.provider_id));
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Browse signal providers and copy their trades automatically
        </p>
      </div>

      {/* Provider Grid */}
      {providerList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {providerList.map((provider, i) => (
            <div
              key={provider.id}
              className="animate-card-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <ProviderCard
                provider={provider}
                isFollowing={followedIds.has(provider.id)}
                currentUserId={user?.id ?? null}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-[var(--color-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1">No signal providers yet</h3>
          <p className="text-sm text-[var(--color-muted)] text-center max-w-sm">
            Signal providers will appear here once an admin enables them. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
