import { products as mockProducts } from "../lib/products";
import { z } from "zod";
import type { Product } from "@/types/product";

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  category: z.string(),
  description: z.string(),
  price: z.number(),
  stock: z.number(),
  rating: z.number(),
  tags: z.array(z.string()),
  image_urls: z.string(),
  created_at: z.string(),
});

export async function getProducts(): Promise<Product[]> {
  // For now this returns local mock data; replace with DB call later.
  return mockProducts as Product[];
}

export { mockProducts };
