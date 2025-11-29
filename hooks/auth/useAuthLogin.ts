"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export function useOAuthLogin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = (provider: "google" | "github") => {
    try {
      setLoading(true);
      // Redirect to server route for OAuth
      window.location.href = `/api/oauth/${provider}`;
    } catch (err: any) {
      toast({
        title: "OAuth login failed ⚠️",
        description: err.message ?? "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleOAuthLogin, loading };
}
