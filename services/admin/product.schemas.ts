import { z } from "zod";

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  base_price_kes: z.number().min(0),
  stock: z.number().min(0),
  category_id: z.string().min(1),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  base_price_kes: z.number().min(0),
  stock: z.number().min(0),
  category_id: z.string().min(1),
});
