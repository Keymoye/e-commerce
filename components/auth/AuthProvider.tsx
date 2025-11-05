"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import Loading from "@/app/loading";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      try {
        // Start Supabase cookie <-> memory sync
        await supabase.auth.startAutoRefresh();

        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;

        // Hydrate user state from session
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error("Error syncing session:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    syncSession();

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) setUser(session?.user ?? null);
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user ?? null);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
