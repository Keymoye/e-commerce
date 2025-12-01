// /app/api/login/route.ts
import { NextResponse } from "next/server";
import { loginService } from "@/services/auth";
import { logger } from "@/lib/logger";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requestId =
      request.headers.get("x-request-id") ??
      crypto.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    logger.info({ requestId }, "login attempt", { body });
    const result = await loginService(body);
    const res = NextResponse.json(
      { message: "Login successful", ...result },
      { status: 200 }
    );
    res.headers.set("x-request-id", requestId);
    return res;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status = (err as { status?: number })?.status ?? 500;
    logger.error(
      { requestId: request.headers.get("x-request-id") ?? "-" },
      "login error",
      err
    );
    return NextResponse.json({ error: message }, { status });
  }
}
