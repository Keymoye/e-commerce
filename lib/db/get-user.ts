import type { User } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/db/server";
import { logger } from '@/lib/logger';

export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
  } catch (err) {
    logger.error({ message: "Failed to get user", error: err });
    return null;
  }
}
