"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/toast";

export function useLogout() {
  const router = useRouter();
  const { toast } = useToast();

  const logout = async () => {
    console.log("🚪 Attempting to log out...");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Logout failed:", error.message);
        toast({
          title: "Logout failed 🚫",
          description: error.message,
          variant: "destructive",
        });
        return; // stop execution if there's an error
      }

      console.log("✅ Logout successful");
      toast({
        title: "Logged out successfully 👋",
        description: "Redirecting to login...",
      });

      router.push("/auth/login");
    } catch (err) {
      // Catch unexpected runtime errors
      console.error("⚠️ Unexpected error during logout:", err);
      toast({
        title: "Unexpected Error ⚠️",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { logout };
}
