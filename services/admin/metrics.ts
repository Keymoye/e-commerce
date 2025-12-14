import { createAdminSupabase } from "@/lib/supabase/admin";

export async function getDashboardMetrics() {
  const supabase = createAdminSupabase();

  const [{ count: products }, { count: users }, { count: orders }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
    ]);

  return {
    totalProducts: products ?? 0,
    totalUsers: users ?? 0,
    totalOrders: orders ?? 0,
  };
}
