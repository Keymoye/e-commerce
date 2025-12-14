"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import logger from "@/lib/logger";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  // Only update user if auth state actually changes
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user?.id !== user?.id) {
          setUser(session?.user ?? null);
          logger.info("AuthProvider", "Auth state changed", {
            userId: session?.user?.id,
          });
        }
      }
    );

    // Done loading immediately if initialUser exists
    if (initialUser) setLoading(false);

    return () => subscription.subscription.unsubscribe();
  }, [initialUser, user]);

  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id !== user?.id) setUser(session?.user ?? null);
      logger.debug("AuthProvider", "User manually refreshed");
    } catch (err) {
      logger.error("AuthProvider", "Failed to refresh user", {
        error: String(err),
      });
    }
  }, [user]);

  if (loading) return <h2>Loading...</h2>;

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
