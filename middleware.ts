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

  if (isProtected && !session) {
    logger.warn("Middleware", `Blocked access to protected route`, {
      path: pathname,
      requestId,
    });

    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("x-request-id", requestId);

  logger.debug("Middleware", "Request allowed", {
    path: pathname,
    requestId,
  });

  return res;
}

// Apply middleware to all pages except static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
