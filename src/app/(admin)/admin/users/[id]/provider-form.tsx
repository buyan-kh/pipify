"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SignalProvider } from "@/lib/types";

export function ProviderForm({
  userId,
  provider,
}: {
  userId: string;
  provider: SignalProvider | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(provider?.description ?? "");
  const [riskLevel, setRiskLevel] = useState(provider?.risk_level ?? "medium");
  const [minDeposit, setMinDeposit] = useState(
    provider?.min_deposit?.toString() ?? "100"
  );
  const [feePercentage, setFeePercentage] = useState(
    provider?.fee_percentage?.toString() ?? "0"
  );
  const [isPublic, setIsPublic] = useState(provider?.is_public ?? true);

  async function handleEnable() {
    setLoading(true);
    try {
      await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          description,
          risk_level: riskLevel,
          min_deposit: Number(minDeposit),
          fee_percentage: Number(feePercentage),
          is_public: isPublic,
        }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    try {
      await fetch("/api/admin/providers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-sm">Signal Provider</h3>
          {provider && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--color-success-subtle)] text-[var(--color-success)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
              Active
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Experienced forex trader..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Risk Level
            </label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as "low" | "medium" | "high")}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Min Deposit ($)
            </label>
            <input
              type="number"
              value={minDeposit}
              onChange={(e) => setMinDeposit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Fee (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={feePercentage}
              onChange={(e) => setFeePercentage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-[var(--color-border)]"
          />
          <label htmlFor="is_public" className="text-xs text-[var(--color-muted)]">
            Visible in marketplace
          </label>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleEnable}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {loading ? "Saving..." : provider ? "Update Provider" : "Enable as Provider"}
        </button>
        {provider && (
          <button
            onClick={handleDisable}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[var(--color-danger)] border border-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] disabled:opacity-50"
          >
            Remove Provider
          </button>
        )}
      </div>
    </div>
  );
}
