"use client";

import React from "react";
import logger from "@/lib/logger";

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
  },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error("Unhandled UI error:", error, info);
    // place to integrate Sentry or other error provider
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center bg-primary p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-foreground/70 mb-4">
              An unexpected error occurred. Please refresh the page or contact
              support if the problem persists.
            </p>
            <button
              onClick={() => location.reload()}
              className="bg-secondary text-background px-4 py-2 rounded"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
