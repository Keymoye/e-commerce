"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export function useLogout() {
  const router = useRouter();
  const { toast } = useToast();

  const logout = async () => {
    console.log("🚪 Logging out...");

    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Logout failed");
      }

      toast({
        title: "Logged out 👋",
        description: "Redirecting to login...",
      });

      setTimeout(() => {
        router.replace("/login");
      }, 800);
    } catch (err: any) {
      console.error("⚠️ Unexpected logout error:", err);
      toast({
        title: "Unexpected error ⚠️",
        description: err.message ?? "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { logout };
}
