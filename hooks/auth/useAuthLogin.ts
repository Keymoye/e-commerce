'use client';
import { useUIStore } from '@/store/uiStore';
import { supabase } from '@/lib/supabase/client';

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
