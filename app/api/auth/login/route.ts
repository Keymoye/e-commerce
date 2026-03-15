// /app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { withErrorHandler } from '@/errors/error-handler';
import { AppError } from '@/errors/base-error';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// ── Validation schema (Zod) ────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

// ── POST /api/login ─────────────────────────────────────────────────
export const POST = withErrorHandler(async (req: NextRequest) => {
  // 1. Validate
  const body   = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.validation('Invalid login credentials', { issues: parsed.error.issues });
  }

  // Build response object first so SSR client can write cookies onto it
  const res = NextResponse.json({ data: { success: true } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email:    parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    logger.warn({ message: 'login failed', email: parsed.data.email, error: error?.message });
    throw AppError.unauthorized('Invalid email or password');
  }

  logger.info({ message: 'login successful', userId: data.user.id });

  // Return the pre-built response — session cookies are already set on it
  return NextResponse.json(
    { data: { user: data.user }, meta: { timestamp: new Date().toISOString() } },
    {
      headers: res.headers,  // carries the Set-Cookie headers
    }
  );
});
