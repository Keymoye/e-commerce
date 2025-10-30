"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { FiX } from "react-icons/fi"; // ✅ React Icons import

type Toast = {
  id: number; // ✅ Unique ID to manage individual dismissals
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

type ToastContextType = {
  toast: (t: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ✅ Create a new toast
  const toast = (t: Omit<Toast, "id">) => {
    const newToast = { ...t, id: Date.now() };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => removeToast(newToast.id), 3000);
  };

  // ✅ Remove a specific toast
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start justify-between gap-3 p-3 rounded-lg shadow-md text-sm min-w-[250px] transition-all duration-200 ${
              t.variant === "destructive"
                ? "bg-red-600 text-white"
                : "bg-secondary text-background"
            }`}
          >
            <div className="flex-1">
              <strong>{t.title}</strong>
              {t.description && (
                <p className="text-xs opacity-90 mt-1">{t.description}</p>
              )}
            </div>

            {/* ✅ Interactive “X” button */}
            <button
              onClick={() => removeToast(t.id)}
              className="text-inherit hover:opacity-70 transition"
              aria-label="Close toast"
            >
              <FiX size={16} />
            </button>
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
