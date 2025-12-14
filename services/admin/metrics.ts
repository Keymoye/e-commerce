// services/admin/metrics.ts
import { adminSupabase } from "@/lib/supabase/admin";

export async function getDashboardMetrics() {
  const [{ count: products }, { count: users }, { count: orders }] =
    await Promise.all([
      adminSupabase
        .from("products")
        .select("*", { count: "exact", head: true }),
      adminSupabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),
      adminSupabase.from("orders").select("*", { count: "exact", head: true }),
    ]);

  return {
    totalProducts: products ?? 0,
    totalUsers: users ?? 0,
    totalOrders: orders ?? 0,
  };
}
