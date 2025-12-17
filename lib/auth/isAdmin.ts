// lib/auth/isAdmin.ts
import { getUser } from "../supabase/getUser";
import { createAdminSupabase } from "../supabase/admin";

export async function isAdmin(): Promise<boolean> {
  const user = await getUser();

  console.log("[isAdmin] user:", user?.id);

  if (!user) {
    console.log("[isAdmin] no user");
    return false;
  }

  const adminSupabase = createAdminSupabase();

  const { data, error } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  console.log("[isAdmin] profile:", data, "error:", error);

  return data?.role === "admin";
}
