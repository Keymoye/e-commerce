"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);

  const initialUserRef = useRef(initialUser);

  // Mount auth listener ONCE
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      logger.info("AuthProvider", "Auth event", {
        event,
        userId: session?.user?.id,
      });

      setUser(session?.user ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Optional manual refresh
  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user ?? null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
