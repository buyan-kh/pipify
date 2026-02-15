export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { UserPnLSummary } from "@/lib/types";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase.rpc("get_all_users_pnl");
  const allUsers = (users ?? []) as UserPnLSummary[];

  const totalUsers = allUsers.length;
  const totalProfit = allUsers.reduce((sum, u) => sum + Number(u.net_profit), 0);
  const totalTrades = allUsers.reduce((sum, u) => sum + Number(u.total_trades), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin - All Users</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <p className="text-sm text-[var(--color-muted)] font-medium">Total Users</p>
          <p className="text-2xl font-bold mt-1">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <p className="text-sm text-[var(--color-muted)] font-medium">Platform P&L</p>
          <p className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
            ${totalProfit.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <p className="text-sm text-[var(--color-muted)] font-medium">Total Trades</p>
          <p className="text-2xl font-bold mt-1">{totalTrades}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]">User</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-muted)]">Trades</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-muted)]">Open</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-muted)]">Profit</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-muted)]">Commission</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-muted)]">Net P&L</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted)]"></th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.user_id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{user.full_name || "—"}</p>
                      <p className="text-xs text-[var(--color-muted)]">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{user.total_trades}</td>
                  <td className="px-4 py-3 text-right">{user.open_trades}</td>
                  <td className={`px-4 py-3 text-right font-medium ${Number(user.total_profit) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                    ${Number(user.total_profit).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">${Number(user.total_commission).toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${Number(user.net_profit) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                    ${Number(user.net_profit).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.user_id}`}
                      className="text-[var(--color-primary)] hover:underline text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {allUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-muted)]">
                    No users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
