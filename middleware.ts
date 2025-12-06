import { NextResponse, type NextRequest } from "next/server";
import logger from "@/lib/logger";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoutes = [
    "/login",
    "/",
    "/cart",
    "/categories",
    "/auth",
    "/api",
    "/favicon.ico",
  ];
  const isPublic = publicRoutes.some((p) => pathname.startsWith(p));

  const session = req.cookies.get("sb-access-token");

  const id =
    req.headers.get("x-request-id") ??
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (!isPublic && !session) {
    logger.warn("Middleware", `Blocked access to protected route`, {
      path: pathname,
      requestId: id,
    });
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("x-request-id", id);
  logger.debug("Middleware", "Request processed", {
    path: pathname,
    requestId: id,
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
