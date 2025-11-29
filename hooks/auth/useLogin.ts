"use client";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";
import fetchJson from "@/lib/api";

interface LoginData {
  email: string;
  password: string;
}

export function useLogin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      await fetchJson("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      toast({
        title: "Welcome back 👋",
        description: "Redirecting to your dashboard...",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      toast({
        title: "Login failed 🚫",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
