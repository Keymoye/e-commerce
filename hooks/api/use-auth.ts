'use client';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { supabase } from '@/lib/db/client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { isApiError } from '@/types/api.types';

interface LoginData { email: string; password: string; }

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function useOAuthLogin() {
  const showToast = useUIStore((s) => s.showToast);

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) showToast({ type: 'error', message: error.message });
  };

  return { handleOAuthLogin, loading: false };
}

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

export function useRegister() {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const { setLoading, isLoading, showToast } = useUIStore();
  const LOADING_KEY = 'auth.register';

  const onSubmit = async (data: RegisterForm) => {
    setLoading(LOADING_KEY, true);
    try {
      const res  = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email:    data.email,
          password: data.password,
        }),
      });
      const json = await res.json();

      if (isApiError(json)) {
        handleError(json);
        return;
      }

      showToast({ type: 'success', message: 'Account created! Please check your email.' });
      router.push('/login');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(LOADING_KEY, false);
    }
  };

  return { onSubmit, loading: isLoading(LOADING_KEY) };
}
