'use client';
import { useUIStore } from '@/store/uiStore';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

// ── Keep useToast for backwards compatibility with existing components ──
// It maps old { title, description, variant } shape to new uiStore shape
export function useToast() {
  const showToast = useUIStore((s) => s.showToast);

  const toast = ({
    title,
    description,
    variant,
  }: {
    title:        string;
    description?: string;
    variant?:     'default' | 'destructive';
  }) => {
    const message = description ? `${title} ${description}` : title;
    showToast({
      type: variant === 'destructive' ? 'error' : 'success',
      message,
    });
  };

  return { toast };
}

// ── Icons per toast type ─────────────────────────────────────────────
const ICONS = {
  success: <FiCheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />,
  error:   <FiAlertCircle className="text-red-500   shrink-0 mt-0.5" size={16} />,
  warning: <FiAlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />,
  info:    <FiInfo className="text-blue-500  shrink-0 mt-0.5" size={16} />,
};

const BG = {
  success: 'bg-background border border-green-200',
  error:   'bg-background border border-red-200',
  warning: 'bg-background border border-yellow-200',
  info:    'bg-background border border-blue-200',
};

// ── ToastContainer — reads from uiStore, renders all active toasts ───
export function ToastContainer() {
  const toasts      = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-start gap-3 p-3 rounded-lg shadow-lg text-sm
            pointer-events-auto
            animate-in slide-in-from-bottom-2 fade-in duration-200
            ${BG[t.type]}
          `}
        >
          {ICONS[t.type]}
          <p className="flex-1 text-foreground">{t.message}</p>
          <button
            onClick={() => dismissToast(t.id)}
            className="text-foreground/40 hover:text-foreground/80 transition shrink-0"
            aria-label="Dismiss"
          >
            <FiX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── ToastProvider — kept for AppProviders compatibility ─────────────
// It no longer manages state (uiStore does), but must still wrap children
// so existing useToast() callers inside it don't break.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
