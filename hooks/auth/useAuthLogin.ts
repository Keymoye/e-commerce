"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export function useOAuthLogin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = (provider: "google" | "github") => {
    try {
      setLoading(true);
      window.location.href = `/api/oauth/${provider}`;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong";
      toast({
        title: "OAuth login failed ⚠️",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleOAuthLogin, loading };
}
