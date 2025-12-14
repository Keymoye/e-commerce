import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function isAdmin(): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .single();

  if (error || !data) return false;
  return data.role === "admin";
}
