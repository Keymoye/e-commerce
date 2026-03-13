// lib/auth/isAdmin.ts
import { getUser } from "../supabase/getUser";
import { createAdminSupabase } from "../supabase/admin";
import { logger } from '@/logger';

export async function isAdmin(): Promise<boolean> {
  const user = await getUser();

  logger.debug({ message: "[isAdmin] user", userId: user?.id });

  if (!user) {
    logger.debug({ message: "[isAdmin] no user" });
    return false;
  }

  const adminSupabase = createAdminSupabase();

  const { data, error } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  logger.debug({ message: "[isAdmin] profile", data, error });

  return data?.role === "admin";
}
