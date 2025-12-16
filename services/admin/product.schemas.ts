import { z } from "zod";

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  category: z.string().min(1),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  category: z.string().min(1),
});
