// lib/auth/isAdmin.ts
import { getUser } from "../db/get-user";
import { createAdminSupabase } from "../db/admin";
import { logger } from '@/lib/logger';

export async function isAdmin(): Promise<boolean> {
  const user = await getUser();

  logger.debug({ message: "[isAdmin] user", userId: user?.id });

  if (!user) {
    logger.debug({ message: "[isAdmin] no user" });
    return false;
  }

  const adminSupabase = createAdminSupabase();

  const { data, error } = await adminSupabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  logger.debug({ message: "[isAdmin] profile", data, error });

  return data?.is_admin === true;
}
