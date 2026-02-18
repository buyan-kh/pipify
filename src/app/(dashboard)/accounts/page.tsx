"use client";

import { createClient } from "@/lib/supabase/client";
import type { MT5Account } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const MT5_SERVERS = [
  "MetaQuotes-Demo",
  "ICMarketsSC-Demo",
  "ICMarketsSC-Live01",
  "ICMarketsSC-Live02",
  "ICMarketsSC-Live03",
  "ICMarketsSC-Live04",
  "ICMarketsSC-Live06",
  "ICMarketsSC-Live07",
  "ICMarkets-Demo",
  "ICMarkets-Live01",
  "ICMarkets-Live02",
  "Pepperstone-Demo",
  "Pepperstone-Live",
  "Pepperstone-Edge-Demo",
  "Pepperstone-Edge-Live",
  "FPMarkets-Demo",
  "FPMarkets-Live",
  "Exness-MT5Real",
  "Exness-MT5Trial",
  "Exness-MT5Real2",
  "Exness-MT5Real3",
  "Exness-MT5Real4",
  "Exness-MT5Real6",
  "Exness-MT5Real7",
  "XMGlobal-MT5",
  "XMGlobal-MT5 2",
  "XMGlobal-MT5 3",
  "FTMO-Demo",
  "FTMO-Server",
  "FTMO-Server2",
  "FundedNext-Demo",
  "FundedNext-Server",
  "OctaFX-Demo",
  "OctaFX-Real",
  "RoboForex-Demo",
  "RoboForex-ECN",
  "RoboForex-Prime",
  "Tickmill-Demo",
  "Tickmill-Live",
  "FBS-Demo",
  "FBS-Real",
  "Deriv-Demo",
  "Deriv-Server",
  "Deriv-Server-02",
  "OANDA-OandaPractice-1",
  "OANDA-OandaLive-1",
  "AdmiralMarkets-Demo",
  "AdmiralMarkets-Live",
  "AvaTrade-Demo",
  "AvaTrade-Live",
  "FXCM-MT5",
  "HFMarkets-Demo",
  "HFMarkets-Live",
  "VantageInternational-Demo",
  "VantageInternational-Live",
  "EightCap-Demo",
  "EightCap-Live",
  "ThinkMarkets-Demo",
  "ThinkMarkets-Live",
  "AXITrader-Demo",
  "AXITrader-Live",
  "BlackBullMarkets-Demo",
  "BlackBullMarkets-Live",
  "MOTCapital-Live-1",
  "MOTCapital-Demo-1",
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<MT5Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    account_name: "",
    server: "",
    login: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showServerSuggestions, setShowServerSuggestions] = useState(false);
  const serverRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const filteredServers = form.server
    ? MT5_SERVERS.filter((s) =>
        s.toLowerCase().includes(form.server.toLowerCase())
      )
    : MT5_SERVERS;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (serverRef.current && !serverRef.current.contains(e.target as Node)) {
        setShowServerSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchAccounts() {
    const { data } = await supabase
      .from("mt5_accounts")
      .select("*")
      .order("created_at", { ascending: false });
    setAccounts((data ?? []) as MT5Account[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setForm({ account_name: "", server: "", login: "", password: "" });
    setShowForm(false);
    setEditId(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/mt5-accounts", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          account_name: form.account_name,
          server: form.server,
          login: parseInt(form.login),
          password: form.password || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save account");
      }

      resetForm();
      fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this MT5 account?")) return;
    await supabase.from("mt5_accounts").delete().eq("id", id);
    fetchAccounts();
  }

  async function handleToggle(id: string, isActive: boolean) {
    await supabase
      .from("mt5_accounts")
      .update({ is_active: !isActive })
      .eq("id", id);
    fetchAccounts();
  }

  function startEdit(account: MT5Account) {
    setEditId(account.id);
    setForm({
      account_name: account.account_name,
      server: account.server,
      login: String(account.login),
      password: "",
    });
    setShowForm(true);
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">MT5 Accounts</h1>
        <p className="text-[var(--color-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">MT5 Accounts</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Add Account
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editId ? "Edit Account" : "New MT5 Account"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Account Name
              </label>
              <input
                type="text"
                value={form.account_name}
                onChange={(e) =>
                  setForm({ ...form, account_name: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                placeholder="My Demo Account"
              />
            </div>
            <div ref={serverRef} className="relative">
              <label className="block text-sm font-medium mb-1.5">Server</label>
              <input
                type="text"
                value={form.server}
                onChange={(e) => {
                  setForm({ ...form, server: e.target.value });
                  setShowServerSuggestions(true);
                }}
                onFocus={() => setShowServerSuggestions(true)}
                required
                autoComplete="off"
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                placeholder="MetaQuotes-Demo"
              />
              {showServerSuggestions && filteredServers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredServers.map((server) => (
                    <button
                      key={server}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, server });
                        setShowServerSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      {server}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Login</label>
              <input
                type="number"
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                required
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                placeholder="12345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Password {editId && "(leave blank to keep current)"}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editId}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                placeholder="MT5 password"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editId ? "Update" : "Add Account"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--color-border)] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 text-center text-[var(--color-muted)]">
          No MT5 accounts added yet. Click &quot;Add Account&quot; to get
          started.
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-xl border border-[var(--color-border)] p-5 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{account.account_name}</h3>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      account.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {account.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  Server: {account.server} &middot; Login: {account.login}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(account.id, account.is_active)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] hover:bg-gray-50 transition-colors"
                >
                  {account.is_active ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => startEdit(account)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
