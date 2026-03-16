import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name too long'),
  description: z.string().max(2000, 'Description too long').optional().default(''),
  base_price_kes: z.number().min(1, 'Price must be greater than 0'),
  base_price_usd: z.number().min(0).optional().default(0),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category_id: z.string().min(1, 'Category is required'),
  brand: z.string().max(80).optional().default(''),
  slug: z.string().min(1, 'Slug is required').max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
  })).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  is_active: z.boolean().optional().default(true),
});

export const updateProductSchema = createProductSchema.partial().extend({
  name: z.string().min(1, 'Name is required').max(120),
});

export const productSchema = createProductSchema.extend({
  id: z.string().uuid(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductInput = z.infer<typeof productSchema>;
