export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8 overflow-auto">{children}</main>
    </div>
  );
}
