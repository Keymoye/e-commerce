"use client";

import React, { useEffect } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AppProviders({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: unknown;
}) {
  useEffect(() => {
    // Initialize Sentry on the client if configured
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (typeof window !== "undefined" && dsn) {
      import("@sentry/react").then((Sentry) => {
        Sentry.init({ dsn, tracesSampleRate: 0.05 });
      });
    }
  }, []);

  return (
    <ToastProvider>
      <AuthProvider initialUser={initialUser}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  );
}
