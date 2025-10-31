"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Save last visited path (for redirect after login)
    if (user && pathname) {
      localStorage.setItem("lastVisitedPath", pathname);
    }

    // Redirect if not logged in
    if (!loading && !user) {
      localStorage.setItem("redirectAfterLogin", pathname);
      router.push("/login");
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-foreground/70 animate-pulse">Checking session...</p>
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
