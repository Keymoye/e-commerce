// services/products.ts
import { supabase } from "@/lib/supabase/client";
import type { Product, CategoryStats } from "@/types/product";

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

// Returns categories with counts and average prices
export async function getCategoriesStats(): Promise<CategoryStats[]> {
  // Select category, count, and average price
  const { data, error } = await supabase
    .from("products")
    .select("category, price", { count: "exact" });

  if (error) throw error;

  // Aggregate counts and avg price
  const categoryMap = new Map<string, { count: number; avgPrice: number }>();

  data.forEach((p: any) => {
    const cat = p.category || "Uncategorized";
    const existing = categoryMap.get(cat) || { count: 0, avgPrice: 0 };
    const newCount = existing.count + 1;
    const newAvgPrice =
      (existing.avgPrice * existing.count + p.price) / newCount;
    categoryMap.set(cat, { count: newCount, avgPrice: newAvgPrice });
  });

  return Array.from(categoryMap, ([name, stats]) => ({
    name,
    count: stats.count,
    avgPrice: stats.avgPrice,
  }));
}
