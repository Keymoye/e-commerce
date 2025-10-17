"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Toast = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};
type ToastContextType = { toast: (t: Toast) => void };

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (t: Toast) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => setToasts((prev) => prev.slice(1)), 3000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((t, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg shadow-md text-sm ${
              t.variant === "destructive"
                ? "bg-red-600 text-white"
                : "bg-secondary text-background"
            }`}
          >
            <strong>{t.title}</strong>
            {t.description && <p>{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
