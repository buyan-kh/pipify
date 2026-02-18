"use client";

import { useState } from "react";
import type { ProviderStats } from "@/lib/types";

const riskConfig = {
  low: { label: "Low Risk", bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
  medium: { label: "Med Risk", bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-400" },
  high: { label: "High Risk", bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" },
};

function getInitials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

const gradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-orange-500 to-red-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-rose-600",
];

function getGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function ProviderCard({
  provider,
  isFollowing: initialFollowing,
  currentUserId,
}: {
  provider: ProviderStats;
  isFollowing: boolean;
  currentUserId: string | null;
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(provider.follower_count);

  const risk = riskConfig[provider.risk_level];
  const initials = getInitials(provider.full_name, provider.email);
  const gradient = getGradient(provider.id);
  const isOwnProvider = currentUserId === provider.user_id;

  async function handleFollowToggle() {
    if (!currentUserId || isOwnProvider) return;
    setLoading(true);

    try {
      if (isFollowing) {
        const res = await fetch("/api/marketplace/follow", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider_id: provider.id }),
        });
        if (res.ok) {
          setIsFollowing(false);
          setFollowerCount((c) => Math.max(0, c - 1));
        }
      } else {
        const res = await fetch("/api/marketplace/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider_id: provider.id }),
        });
        if (res.ok) {
          setIsFollowing(true);
          setFollowerCount((c) => c + 1);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="provider-card group">
      {/* Header */}
      <div className="flex items-start gap-3.5 mb-5">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white truncate">
              {provider.full_name || provider.email.split("@")[0]}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${risk.bg} ${risk.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
              {risk.label}
            </span>
            {provider.total_trades > 0 && (
              <span className="text-[11px] text-slate-500">
                {provider.total_trades} trades
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {provider.description && (
        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
          {provider.description}
        </p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="provider-stat-cell">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">
            Win Rate
          </p>
          <p className="text-lg font-bold text-emerald-400 tabular">
            {provider.win_rate}%
          </p>
        </div>
        <div className="provider-stat-cell">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">
            Monthly
          </p>
          <p
            className={`text-lg font-bold tabular ${
              provider.monthly_return >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {provider.monthly_return >= 0 ? "+" : ""}
            {provider.monthly_return}%
          </p>
        </div>
        <div className="provider-stat-cell">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">
            Total Profit
          </p>
          <p
            className={`text-lg font-bold tabular ${
              provider.total_profit >= 0 ? "text-white" : "text-red-400"
            }`}
          >
            ${Number(provider.total_profit).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="provider-stat-cell">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">
            Followers
          </p>
          <p className="text-lg font-bold text-white tabular">
            {followerCount}
          </p>
        </div>
      </div>

      {/* Meta Row */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-5 px-1">
        <span>Min ${Number(provider.min_deposit).toLocaleString()}</span>
        <span className="w-1 h-1 rounded-full bg-slate-600" />
        <span>{provider.trades_per_day}/day</span>
        <span className="w-1 h-1 rounded-full bg-slate-600" />
        <span>{provider.fee_percentage}% fee</span>
      </div>

      {/* CTAs */}
      <div className="flex gap-2">
        {isOwnProvider ? (
          <div className="flex-1 py-2.5 rounded-lg text-center text-xs font-semibold text-slate-500 bg-slate-800/50 border border-slate-700/50">
            Your Profile
          </div>
        ) : (
          <button
            onClick={handleFollowToggle}
            disabled={loading || !currentUserId}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isFollowing
                ? "bg-slate-700/80 text-slate-300 hover:bg-red-500/20 hover:text-red-400 border border-slate-600/50"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                {isFollowing ? "Unfollowing..." : "Following..."}
              </span>
            ) : isFollowing ? (
              "Following"
            ) : (
              "Start Copying"
            )}
          </button>
        )}
        <button className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-400 border border-slate-700/50 hover:border-slate-600 hover:text-slate-300 transition-colors">
          Details
        </button>
      </div>
    </div>
  );
}
