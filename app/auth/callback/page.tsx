"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finalizeLogin = async () => {
      console.log("🔄 Handling OAuth callback...");

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        console.error("❌ Callback session error:", error);
        router.push("/login");
        return;
      }

      console.log("✅ Session restored:", data.session);
      const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      router.push(redirectTo);
    };

    finalizeLogin();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-[80vh]">
      <p className="animate-pulse text-foreground/70">
        Finishing login, please wait...
      </p>
    </div>
  );
}
