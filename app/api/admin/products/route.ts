import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/error-handler';
import { AppError } from '@/errors/base-error';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { isAdmin } from '@/lib/auth/permissions';
import { createAdminProductService } from '@/services/admin/products';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  base_price_kes: z.number().min(1, 'Price must be greater than 0'),
  base_price_usd: z.number().optional().default(0),
  stock: z.number().int().min(0),
  category_id: z.string().min(1, 'Category is required'),
  brand: z.string().optional().default(''),
  slug: z.string().min(1, 'Slug is required'),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional() })).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  is_active: z.boolean().optional().default(true),
});

export const GET = withErrorHandler(async (req: NextRequest) => {
  const admin = await isAdmin();
  if (!admin) throw AppError.forbidden('Admin access required');

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '10');
  const search = searchParams.get('search') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const isActiveParam = searchParams.get('isActive');
  const isActive = isActiveParam === null ? undefined : isActiveParam === 'true';

  logger.debug({ message: 'Fetching admin products', page, pageSize });

  const svc = createAdminProductService();
  const result = await svc.getProducts({ page, pageSize, search, category, isActive });

  logger.info({ message: 'Admin products fetched successfully', count: result.products.length });
  return NextResponse.json(result);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const admin = await isAdmin();
  if (!admin) throw AppError.forbidden('Admin access required');

  const body = await req.json();
  const validatedData = createProductSchema.parse(body);

  logger.info({ message: 'Admin create product request' });

  const svc = createAdminProductService();
  const product = await svc.createProduct(validatedData);

  logger.info({ message: 'Admin create product success', productId: product.id });
  return NextResponse.json(product, { status: 201 });
});
