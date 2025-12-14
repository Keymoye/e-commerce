// services/admin/products.ts
import { adminSupabase } from "@/lib/supabase/admin";
import type { Product } from "@/types/product";

export async function getAdminProducts(
  page: number,
  pageSize: number
): Promise<{ products: Product[]; totalPages: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await adminSupabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    products: data ?? [],
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}
