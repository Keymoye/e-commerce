import { NextResponse, type NextRequest } from "next/server";
import logger from "@/lib/logger";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only two protected routes
  const protectedRoutes = ["/profile", "/checkout"];
  const isProtected = protectedRoutes.some((p) => pathname.startsWith(p));

  // Read Supabase session cookie
  const session = req.cookies.get("sb-xzrndiwdurqmzouprfmk-auth-token")?.value;

  const requestId =
    req.headers.get("x-request-id") ??
    crypto.randomUUID() ??
    Date.now().toString();

  const log = logger.withContext({ requestId });

  if (isProtected && !session) {
    log.warn("Middleware", "Blocked access to protected route", {
      path: pathname,
    });

    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("x-request-id", requestId);

  log.debug("Middleware", "Request allowed", {
    path: pathname,
  });

  return res;
}

// Apply middleware to all pages except static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
