// lib/supabase/client.ts
// BROWSER ONLY — safe for 'use client' files
// Use ONLY for auth state subscription (onAuthStateChange + getSession)
// NEVER for data queries — those go through /api routes
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// WHO CAN IMPORT THIS:
// ✅ components/auth/AuthProvider.tsx — onAuthStateChange only
// ❌ components/* data queries — use fetch('/api/...') instead
// ❌ hooks/* data queries — use fetch('/api/...') instead
