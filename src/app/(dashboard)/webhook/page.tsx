"use client";

import { createClient } from "@/lib/supabase/client";
import type { WebhookKey } from "@/lib/types";
import { useEffect, useState } from "react";

export default function WebhookPage() {
  const [keys, setKeys] = useState<WebhookKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  async function fetchKeys() {
    const { data } = await supabase
      .from("webhook_keys")
      .select("*")
      .order("created_at", { ascending: false });
    setKeys((data ?? []) as WebhookKey[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getWebhookUrl(key: string) {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/api/webhook/${key}`;
  }

  async function copyUrl(key: string) {
    await navigator.clipboard.writeText(getWebhookUrl(key));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function regenerateKey(id: string) {
    if (!confirm("Regenerate this webhook key? The old URL will stop working."))
      return;

    const newKey = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await supabase.from("webhook_keys").update({ key: newKey }).eq("id", id);
    fetchKeys();
  }

  async function toggleKey(id: string, isActive: boolean) {
    await supabase
      .from("webhook_keys")
      .update({ is_active: !isActive })
      .eq("id", id);
    fetchKeys();
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Webhook Setup</h1>
        <p className="text-[var(--color-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Webhook Setup</h1>

      {keys.map((wk) => (
        <div
          key={wk.id}
          className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{wk.label}</h2>
              <span
                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                  wk.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {wk.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleKey(wk.id, wk.is_active)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] hover:bg-gray-50 transition-colors"
              >
                {wk.is_active ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => regenerateKey(wk.id)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] hover:bg-gray-50 transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>

          <label className="block text-sm font-medium mb-1.5">
            Webhook URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={getWebhookUrl(wk.key)}
              className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-gray-50 font-mono text-sm"
            />
            <button
              onClick={() => copyUrl(wk.key)}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      ))}

      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="text-lg font-semibold mb-4">TradingView Alert Setup</h2>
        <p className="text-sm text-[var(--color-muted)] mb-4">
          In TradingView, create an alert and set the webhook URL to the URL
          above. Use the following JSON format for the alert message:
        </p>
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm font-mono overflow-x-auto">
          {JSON.stringify(
            {
              symbol: "{{ticker}}",
              action: "buy",
              volume: 0.1,
              sl: 0,
              tp: 0,
            },
            null,
            2
          )}
        </pre>
        <p className="text-sm text-[var(--color-muted)] mt-4">
          Supported actions: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">buy</code>,{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">sell</code>,{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">close_buy</code>,{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">close_sell</code>,{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">close_all</code>
        </p>
        <p className="text-sm text-[var(--color-muted)] mt-2">
          You can also use simple text format:{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">EURUSD buy 0.1</code>
        </p>
      </div>
    </div>
  );
}
