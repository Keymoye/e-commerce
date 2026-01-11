"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import logger from "@/lib/logger";

export function useOAuthLogin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      logger.error("OAuthLogin", "OAuth sign-in failed", err);
      toast({
        title: "OAuth login failed ⚠️",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleOAuthLogin, loading };
}
