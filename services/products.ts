// services/products.ts
import { supabase } from "@/lib/supabase/client";
import type { Product } from "@/types/product";

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Product;
}

export async function getPaginatedProducts(
  page: number,
  pageSize: number,
  category?: string,
  search?: string,
  sortBy?: "price-asc" | "price-desc" | "rating" | "newest"
): Promise<{
  products: Product[];
  totalPages: number;
  total: number;
}> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" }) // count = exact to calculate total pages
    .range(from, to);

  // Category filter
  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  // Search filter (ILIKE for case-insensitive match)
  if (search && search.trim().length > 0) {
    // use or(...) to search both fields (name OR description)
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Sorting
  if (sortBy === "price-asc") query = query.order("price", { ascending: true });
  if (sortBy === "price-desc")
    query = query.order("price", { ascending: false });
  if (sortBy === "rating") query = query.order("rating", { ascending: false });
  if (sortBy === "newest")
    query = query.order("created_at", { ascending: false });

  // Execute query
  const { data, error, count } = await query;

  if (error) {
    console.error("Error in getPaginatedProducts:", error.message);
    return {
      products: [],
      totalPages: 1,
      total: 0,
    };
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    products: (data ?? []) as Product[],
    totalPages,
    total,
  };
}

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase.from("products").select("category");

  if (error) throw error;

  // Extract unique categories
  const unique = Array.from(new Set(data.map((p) => p.category)));

  return ["all", ...unique];
}
