import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/error-handler';
import { AppError } from '@/errors/base-error';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { isAdmin } from '@/lib/auth/permissions';
import { createAdminProductService } from '@/services/admin/products';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  base_price_kes: z.number().min(0, 'Price must be non-negative'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  category_id: z.string().min(1, 'Category is required'),
});

export const GET = withErrorHandler(async (req: NextRequest) => {
  logger.info({ message: 'Admin products list request' });

  // Check admin permissions
  const admin = await isAdmin();
  if (!admin) {
    throw AppError.forbidden('Admin access required');
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '10');

  const adminProductService = createAdminProductService();
  const result = await adminProductService.getProducts(page, pageSize);

  logger.info({ message: 'Admin products list success', count: result.products.length });

  return NextResponse.json(result);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  logger.info({ message: 'Admin create product request' });

  // Check admin permissions
  const admin = await isAdmin();
  if (!admin) {
    throw AppError.forbidden('Admin access required');
  }

  const body = await req.json();
  const validatedData = createProductSchema.parse(body);

  const adminProductService = createAdminProductService();
  const product = await adminProductService.createProduct(validatedData);

  logger.info({ message: 'Admin create product success', productId: product.id });

  return NextResponse.json(product, { status: 201 });
});
