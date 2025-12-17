import type { User } from "@supabase/supabase-js";
import { getUser } from "../supabase/getUser";
import { createAdminSupabase } from "../supabase/admin";

export async function isAdmin(): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  // Use SERVICE ROLE for DB check
  const adminSupabase = createAdminSupabase();

  const { data } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return data?.role === "admin";
}
