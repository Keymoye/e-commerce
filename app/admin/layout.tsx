import { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import Sidebar from "@/components/admin/layout/Sidebar";
import TopBar from "@/components/admin/layout/TopBar";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border">
        <Sidebar />
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1">
        <TopBar />

        <main
          id="admin-content"
          className="flex-1 p-6 focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
