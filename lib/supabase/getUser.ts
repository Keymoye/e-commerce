import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import logger from "@/lib/logger";

export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logger.error("Auth", "Supabase auth.getUser returned error", error);
      return null;
    }
    return user;
  } catch (err) {
    logger.error("Auth", "Failed to get user", err);
    return null;
  }
}
