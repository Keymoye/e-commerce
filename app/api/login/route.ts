// /app/api/login/route.ts
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/errors/withErrorHandler";
import { z } from "zod";
import { AppError } from "@/errors/AppError";
import { auth } from "@/services/auth.service";
import { logger } from "@/logger";

// ── Validation schema (Zod) ────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ── POST /api/login ─────────────────────────────────────────────────
export const POST = withErrorHandler(async (request: Request) => {
  // 1. Validate
  const body = await request.json();
  const params = loginSchema.safeParse(body);
  if (!params.success) {
    throw AppError.validation('Invalid login credentials', {
      issues: params.error.issues,
    });
  }

  // 2. Call service
  const result = await auth.login(params.data);
  
  // 3. Return consistent response
  logger.info({ message: 'login successful', userId: result.user.id });
  return NextResponse.json({
    data: result,
    meta: { timestamp: new Date().toISOString() }
  });
});
