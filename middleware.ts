import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();

  const protectedRoutes = ['/profile', '/checkout', '/orders'];
  const isProtected = protectedRoutes.some((p) => pathname.startsWith(p));

  // Build response first so we can pass it to the SSR client for cookie writing
  let res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — this also writes refreshed cookies back to browser
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  // Suppress expected error for unauthenticated requests
  if (authError && authError.name !== 'AuthSessionMissingError') {
    logger.warn({ message: 'Unexpected auth error in middleware', error: authError.message, requestId });
  }

  if (isProtected && !user) {
    logger.warn({ message: 'Blocked access to protected route', path: pathname, requestId });
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  res.headers.set('x-request-id', requestId);
  logger.debug({ message: 'Request allowed', path: pathname, requestId });
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
