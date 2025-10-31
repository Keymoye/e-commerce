"use client";

import { FaUserCircle } from "react-icons/fa";
import { useUserSession } from "@/hooks/useUserSession";
import { useLogout } from "@/hooks/useLogout";
import ProtectedRoute from "@/components/auth/protectedRoute";

export default function ProfilePage() {
  const { user } = useUserSession();
  const { logout } = useLogout();

  return (
    <ProtectedRoute>
      <section className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <FaUserCircle className="text-6xl text-secondary mb-4" />
        <h1 className="text-2xl font-semibold mb-2">
          Welcome, {user?.user_metadata?.full_name || user?.email}
        </h1>
        <p className="text-foreground/60 mb-4">{user?.email}</p>

        <button
          onClick={logout}
          className="bg-primary text-background px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          Logout
        </button>
      </section>
    </ProtectedRoute>
  );
}
