// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // PUBLIC ROUTES
  const publicRoutes = ["/login", "/auth", "/api", "/favicon.ico"];
  const isPublic = publicRoutes.some((p) => pathname.startsWith(p));

  // Get Supabase session cookie
  const session = req.cookies.get("sb-access-token");

  // If route is protected and no session → redirect
  if (!isPublic && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Add a request id header for tracing and logging
  const id =
    req.headers.get("x-request-id") ??
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const response = NextResponse.next();
  response.headers.set("x-request-id", id);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
