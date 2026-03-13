'use client';
import { useRouter } from 'next/navigation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useUIStore } from '@/store/uiStore';
import { isApiError } from '@/types/api.types';

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
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
