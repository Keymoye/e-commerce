"use client";

import { useAuth } from "@/components/auth/AuthProvider";

/**
 * A simple alias hook for semantic clarity.
 * Returns current user, loading state, and refreshUser() method.
 */
export function useUserSession() {
  const { user, loading, refreshUser } = useAuth();
  return { user, loading, refreshUser };
}
