// lib/auth/isAdmin.ts
import { getUser } from "../supabase/getUser";
import { createAdminSupabase } from "../supabase/admin";
import logger from "@/lib/logger";

export async function isAdmin(): Promise<boolean> {
  const log = logger.withContext({});
  const user = await getUser();

  log.debug("Auth", "isAdmin check", { userId: user?.id });

  if (!user) {
    log.debug("Auth", "isAdmin result: no user");
    return false;
  }

  const adminSupabase = createAdminSupabase();

  const { data, error } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    log.error("Auth", "Failed to fetch profile role", error);
    return false;
  }

  const result = data?.role === "admin";
  log.debug("Auth", "isAdmin result", { userId: user.id, isAdmin: result });
  return result;
}
