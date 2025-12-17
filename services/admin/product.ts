// services/admin/products.ts
"use server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function getAdminProducts(page: number, pageSize: number) {
  const supabase = createAdminSupabase();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
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
