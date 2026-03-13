// lib/supabase/server.ts
// SERVER ONLY — do NOT import this in any 'use client' file
import { createServerClient as _createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
 
export async function createServerClient() {
  const cookieStore = await cookies();
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from Server Component — cookies are read-only, ignore
          }
        },
      },
    },
  );
}
 
// WHO CAN IMPORT THIS:
// ✅ services/*.service.ts (L3)
// ✅ app/api/**/route.ts (only for auth session checks)
// ✅ middleware.ts
// ❌ components/* — never
// ❌ hooks/* — never
// ❌ store/* — never
