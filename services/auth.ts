import { z } from "zod";
import { createServerSupabaseClient } from "../lib/supabase/server";
import AppError from "../lib/errors";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginService(body: unknown) {
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError("Invalid login payload", 400);
  }

  const { email, password } = parsed.data;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AppError(error.message || "Login failed", 401);
  }

  return { user: data.user };
}

export async function signupService(body: unknown) {
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError("Invalid signup payload", 400);
  }

  const { fullName, email, password } = parsed.data;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    throw new AppError(error.message || "Signup failed", 400);
  }

  return { user: data.user };
}

export async function logoutService() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new AppError(error.message || "Logout failed", 400);
  }
  return { ok: true };
}

// Named exports only — prefer named imports in callers
