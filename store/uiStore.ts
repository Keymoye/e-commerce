'use client';
import { create } from 'zustand';
 
type ToastType = 'success' | 'error' | 'info' | 'warning';
type Toast = { id: string; type: ToastType; message: string };
 
type UIStore = {
  toasts:      Toast[];
  showToast:   (toast: Omit<Toast, 'id'>) => void;
  dismissToast:(id: string) => void;
  loadingKeys: Set<string>;
  setLoading:  (key: string, loading: boolean) => void;
  isLoading:   (key: string) => boolean;
};
export const useUIStore = create<UIStore>((set, get) => ({
  toasts: [],
  showToast: (toast) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    // Auto-dismiss after 5 seconds
    setTimeout(() => get().dismissToast(id), 5000);
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
 
  loadingKeys: new Set(),
  setLoading: (key, loading) =>
    set((s) => {
      const keys = new Set(s.loadingKeys);
      loading ? keys.add(key) : keys.delete(key);
      return { loadingKeys: keys };
    }),
  isLoading: (key) => get().loadingKeys.has(key),
}));
