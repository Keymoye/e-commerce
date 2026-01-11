// /app/api/login/route.ts
import { NextResponse } from "next/server";
import { loginService } from "@/services/auth";
import { logger } from "@/lib/logger";
import { withApiHandler } from "@/lib/apiHandler";

export const POST = withApiHandler(async (request: Request, { requestId }) => {
  // NOTE: avoid logging PII in production logs; sanitize before sending to external sinks
  const body = await request.json();
  logger.info({ requestId }, "login attempt", { body });

  const result = await loginService(body);
  const res = NextResponse.json(
    { message: "Login successful", ...result },
    { status: 200 }
  );
  res.headers.set("x-request-id", requestId);
  return res;
});
