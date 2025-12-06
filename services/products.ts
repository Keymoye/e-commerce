import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/types/product";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getProducts(filters?: {
  category?: string;
  search?: string;
  sortBy?: "price" | "rating" | "newest";
  limit?: number;
}): Promise<Product[]> {
  let query = supabase.from("products").select("*");

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Sorting
  if (filters?.sortBy === "price") {
    query = query.order("price", { ascending: true });
  } else if (filters?.sortBy === "rating") {
    query = query.order("rating", { ascending: false });
  } else if (filters?.sortBy === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    // default sort: newest first
    query = query.order("created_at", { ascending: false });
  }

  // Limit results
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Product;
}
export async function getPaginatedProducts(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .range(from, to);

  if (error) throw error;

  return {
    products: data as Product[],
    total: count ?? 0,
    totalPages: count ? Math.ceil(count / pageSize) : 1,
    page,
    pageSize,
  };
}
