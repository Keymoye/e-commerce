import { ReactNode } from "react";
import { isAdmin } from "@/lib/auth/isAdmin";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { redirect } from "next/dist/client/components/navigation";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200">
        <Sidebar />
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1">
        <TopBar />

        <main
          id="admin-content"
          className="flex-1 p-6 bg-gray-50 focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
