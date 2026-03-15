import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/error-handler';
import { AppError } from '@/errors/base-error';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { isAdmin } from '@/lib/auth/permissions';
import { createAdminProductService } from '@/services/admin/products';

const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  base_price_kes: z.number().min(0, 'Price must be non-negative'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  category_id: z.string().min(1, 'Category is required'),
});

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  logger.info({ message: 'Admin get product request', productId: params.id });

  // Check admin permissions
  const admin = await isAdmin();
  if (!admin) {
    throw AppError.forbidden('Admin access required');
  }

  const adminProductService = createAdminProductService();
  const product = await adminProductService.getProductById(params.id);

  if (!product) {
    throw AppError.notFound('Product not found');
  }

  logger.info({ message: 'Admin get product success', productId: params.id });

  return NextResponse.json(product);
});

export const PUT = withErrorHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  logger.info({ message: 'Admin update product request', productId: params.id });

  // Check admin permissions
  const admin = await isAdmin();
  if (!admin) {
    throw AppError.forbidden('Admin access required');
  }

  const body = await req.json();
  const validatedData = updateProductSchema.parse(body);

  const adminProductService = createAdminProductService();
  const product = await adminProductService.updateProduct(params.id, { ...validatedData, id: params.id });

  logger.info({ message: 'Admin update product success', productId: params.id });

  return NextResponse.json(product);
});

export const DELETE = withErrorHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  logger.info({ message: 'Admin delete product request', productId: params.id });

  // Check admin permissions
  const admin = await isAdmin();
  if (!admin) {
    throw AppError.forbidden('Admin access required');
  }

  const adminProductService = createAdminProductService();
  await adminProductService.deleteProduct(params.id);

  logger.info({ message: 'Admin delete product success', productId: params.id });

  return NextResponse.json({ success: true });
});
