'use client';
import { useRouter } from 'next/navigation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useUIStore } from '@/store/uiStore';
import { isApiError } from '@/types/api.types';

interface LoginData { email: string; password: string; }

export function useLogin() {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const { setLoading, isLoading, showToast } = useUIStore();
  const LOADING_KEY = 'auth.login';

  const login = async (data: LoginData) => {
    setLoading(LOADING_KEY, true);
    try {
      const res  = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (isApiError(json)) {
        handleError(json);
        return;
      }

      showToast({ type: 'success', message: 'Welcome back! Redirecting...' });
      router.refresh(); // Revalidates server components with new session
      router.push('/');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(LOADING_KEY, false);
    }
  };

  return { login, loading: isLoading(LOADING_KEY) };
}
