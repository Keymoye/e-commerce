'use client';
import { useRouter } from 'next/navigation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useUIStore } from '@/store/uiStore';
import { isApiError } from '@/types/api.types';

export function useLogout() {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const { setLoading, isLoading, showToast } = useUIStore();
  const LOADING_KEY = 'auth.logout';

  const logout = async () => {
    setLoading(LOADING_KEY, true);
    try {
      const res  = await fetch('/api/logout', { method: 'POST' });
      const json = await res.json();

      if (isApiError(json)) {
        handleError(json);
        return;
      }

      showToast({ type: 'success', message: 'Logged out successfully.' });
      router.refresh();
      router.replace('/login');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(LOADING_KEY, false);
    }
  };

  return { logout, loading: isLoading(LOADING_KEY) };
}
