import { z } from "zod";
import { createServerSupabaseClient } from "../lib/supabase/server";
import AppError from "../lib/errors";
import logger from "@/lib/logger";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

function maskEmail(email: string) {
  return email.replace(
    /(.{2})(.*)(@.*)/,
    (_: string, a: string, b: string, c: string) => `${a}***${c}`
  );
}

type ServiceCtx = { requestId?: string; userId?: string } | undefined;

export async function loginService(body: unknown, ctx?: ServiceCtx) {
  const log = logger.withContext(ctx ?? {});

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    log.warn("Auth", "Invalid login payload", { errors: parsed.error.errors });
    throw new AppError("Invalid login payload", 400, {
      code: "INVALID_PAYLOAD",
    });
  }

  const { email, password } = parsed.data;
  log.info("Auth", "login attempt", { email: maskEmail(email) });

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      log.warn("Auth", "login failed", {
        email: maskEmail(email),
        reason: error.message,
      });
      throw new AppError(error.message || "Login failed", 401, {
        code: "AUTH_FAILED",
      });
    }

    log.info({ userId: data.user?.id }, "Auth", "login success");

    return { user: data.user };
  } catch (err: unknown) {
    log.error("Auth", "Unexpected error during login", err);
    throw err instanceof AppError
      ? err
      : new AppError("Internal server error", 500);
  }
}

export async function signupService(body: unknown, ctx?: ServiceCtx) {
  const log = logger.withContext(ctx ?? {});

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    log.warn("Auth", "Invalid signup payload", { errors: parsed.error.errors });
    throw new AppError("Invalid signup payload", 400, {
      code: "INVALID_PAYLOAD",
    });
  }

  const { fullName, email, password } = parsed.data;
  log.info("Auth", "signup attempt", { email: maskEmail(email), fullName });

  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      log.warn("Auth", "signup failed", {
        email: maskEmail(email),
        reason: error.message,
      });
      throw new AppError(error.message || "Signup failed", 400, {
        code: "SIGNUP_FAILED",
      });
    }

    log.info({ userId: data.user?.id }, "Auth", "signup success");

    return { user: data.user };
  } catch (err: unknown) {
    log.error("Auth", "Unexpected error during signup", err);
    throw err instanceof AppError
      ? err
      : new AppError("Internal server error", 500);
  }
}

export async function logoutService(ctx?: ServiceCtx) {
  const log = logger.withContext(ctx ?? {});
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      log.warn("Auth", "logout failed", { reason: error.message });
      throw new AppError(error.message || "Logout failed", 400, {
        code: "LOGOUT_FAILED",
      });
    }
    log.info("Auth", "logout success");
    return { ok: true };
  } catch (err: unknown) {
    log.error("Auth", "Unexpected error during logout", err);
    throw err instanceof AppError
      ? err
      : new AppError("Internal server error", 500);
  }
}

// Named exports only — prefer named imports in callers
