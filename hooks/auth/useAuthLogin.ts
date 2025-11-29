"use client";
import { useToast } from "@/components/ui/toast";

export function useOAuthLogin() {
  const { toast } = useToast();

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setLoading(true);
      // call server route to start OAuth
      window.location.href = `/api/oauth/${provider}`;
    } catch (err: any) {
      toast({
        title: "OAuth error ⚠️",
        description: err.message ?? "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return { handleOAuthLogin };
}
