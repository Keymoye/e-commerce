// services/admin/products.ts
"use server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { productSchema, createProductSchema } from "./product.schemas";
import { Product } from "@/types/product";
import { z } from "zod";

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

export async function getAdminProductById(id: string): Promise<Product | null> {
  const supabase = createAdminSupabase();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function updateAdminProduct(data: z.infer<typeof productSchema>) {
  const parsed = productSchema.parse(data);
  const supabase = createAdminSupabase();

  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.name,
      price: parsed.price,
      stock: parsed.stock,
      category: parsed.category,
    })
    .eq("id", parsed.id);

  if (error) throw error;

  return true;
}

export async function createAdminProduct(
  data: z.infer<typeof createProductSchema>
) {
  const parsed = createProductSchema.parse(data);
  const supabase = createAdminSupabase();
  const { data: product, error } = await supabase
    .from("products")
    .insert([parsed])
    .select()
    .single();

  if (error) throw error;

  return product;
}

export async function deleteAdminProduct(productId: string) {
  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw error;

  return true;
}
