import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/error-handler';
import { AppError } from '@/errors/base-error';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { isAdmin } from '@/lib/auth/permissions';
import { createAdminProductService } from '@/services/admin/products';

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  base_price_kes: z.number().min(1).optional(),
  base_price_usd: z.number().optional(),
  stock: z.number().int().min(0).optional(),
  category_id: z.string().optional(),
  brand: z.string().optional(),
  slug: z.string().optional(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional() })).optional(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

export const GET = withErrorHandler(async (req: NextRequest, ctx: any) => {
  const { id } = ctx.params as { id: string };
  const admin = await isAdmin();
  if (!admin) throw AppError.forbidden('Admin access required');

  logger.info({ message: 'Admin get product request', productId: id });
  const svc = createAdminProductService();
  const product = await svc.getProductById(id);

  return NextResponse.json(product);
});

export const PUT = withErrorHandler(async (req: NextRequest, ctx: any) => {
  const { id } = ctx.params as { id: string };
  const admin = await isAdmin();
  if (!admin) throw AppError.forbidden('Admin access required');

  const body = await req.json();
  const validatedData = updateProductSchema.parse(body);

  logger.info({ message: 'Admin update product request', productId: id });
  const svc = createAdminProductService();
  const product = await svc.updateProduct(id, validatedData);

  logger.info({ message: 'Admin update product success', productId: id });
  return NextResponse.json(product);
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx: any) => {
  const { id } = ctx.params as { id: string };
  const admin = await isAdmin();
  if (!admin) throw AppError.forbidden('Admin access required');

  logger.info({ message: 'Admin delete product request', productId: id });
  const svc = createAdminProductService();
  await svc.deleteProduct(id);

  logger.info({ message: 'Admin delete product success', productId: id });
  return NextResponse.json({ success: true });
});
