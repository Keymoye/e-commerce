"use client";
import { useToast } from "@/components/ui/toast";

export function useLogin() {
  const { toast } = useToast();

  const login = async (data: LoginData) => {
    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Login failed");
      }

      toast({
        title: "Welcome back 👋",
        description: "Redirecting to your dashboard...",
      });
    } catch (err: any) {
      toast({
        title: "Login failed 🚫",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    return { login };
  };
}
