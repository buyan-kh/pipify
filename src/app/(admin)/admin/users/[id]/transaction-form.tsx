"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TransactionForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          type,
          amount: parseFloat(amount),
          note: note || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create transaction");
      }

      setAmount("");
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-4 shadow-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-4">
        Record Transaction
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-1.5">
            Type
          </label>
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as "deposit" | "withdrawal")
            }
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-white font-medium"
          >
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-1.5">
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0.00"
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm w-32 tabular font-medium"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-1.5">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Initial deposit"
            className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 shadow-sm shadow-blue-500/20"
        >
          {loading ? "Saving..." : "Add"}
        </button>
      </div>
      {error && (
        <div className="mt-3 bg-[var(--color-danger-subtle)] border border-red-100 rounded-lg px-3 py-2">
          <p className="text-xs text-[var(--color-danger)] font-medium">
            {error}
          </p>
        </div>
      )}
    </form>
  );
}
