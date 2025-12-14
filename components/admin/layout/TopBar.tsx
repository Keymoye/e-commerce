"use client";
import { FiLogOut } from "react-icons/fi";
import { useLogout } from "@/hooks/auth/useLogout";

export default function TopBar() {
  const { logout } = useLogout();
  return (
    <header
      className="h-14 border-b border-border px-6 flex items-center justify-between"
      role="banner"
    >
      <span className="text-sm text-foreground/70">Admin Dashboard</span>

      <button
        onClick={logout}
        className="flex items-center gap-2 text-sm
                   hover:text-destructive focus:outline-none
                   focus:ring-2 focus:ring-destructive"
        aria-label="Sign out"
      >
        <FiLogOut size={16} />
        Logout
      </button>
    </header>
  );
}
