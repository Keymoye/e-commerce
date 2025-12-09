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

  // Centralized session fetch
  const fetchSession = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      logger.info("AuthProvider", "Session synced", {
        userId: session?.user?.id,
      });
    } catch (err) {
      logger.error("AuthProvider", "Failed to sync session", {
        error: String(err),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        logger.info("AuthProvider", "Auth state changed", {
          userId: session?.user?.id,
        });
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [fetchSession]);

  const refreshUser = useCallback(async () => {
    await fetchSession();
    logger.debug("AuthProvider", "User manually refreshed");
  }, [fetchSession]);

  if (loading) return <h2>Loading...</h2>;

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
