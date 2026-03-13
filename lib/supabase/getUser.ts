import type { User } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

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
    console.error("Failed to get user:", err);
    return null;
  }
}
