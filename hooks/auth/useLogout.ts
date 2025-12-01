"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import logger from "@/lib/logger";
import fetchJson from "@/lib/api";

export function useLogout() {
  const router = useRouter();
  const { toast } = useToast();

  const logout = async () => {
    logger.info("Logging out...");

    try {
      await fetchJson("/api/logout", { method: "POST" });

      toast({
        title: "Logged out 👋",
        description: "Redirecting to login...",
      });

      setTimeout(() => {
        router.replace("/login");
      }, 800);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      logger.error("Unexpected logout error:", errorMsg);
      toast({
        title: "Unexpected error ⚠️",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  return { logout };
}
