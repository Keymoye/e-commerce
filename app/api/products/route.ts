import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/withErrorHandler';
import { z } from 'zod';
import { AppError } from '@/errors/AppError';
import { productService } from '@/services/product.service';

// ── Validation schema (Zod) ────────────────────────────────────────────
const querySchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  q:        z.string().max(200).optional(),
});

// ── GET /api/products ─────────────────────────────────────────────────
export const GET = withErrorHandler(async (req: NextRequest) => {
  // 1. Validate
  const params = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!params.success) {
    throw AppError.validation('Invalid query parameters', {
      issues: params.error.issues,
    });
  }

  // 2. Call service — all business logic lives there
  const result = await productService.listProducts(params.data);

  // 3. Return consistent response
  return NextResponse.json({
    data: result.products,
    meta: { 
      page: params.data.page, 
      pageSize: params.data.pageSize, 
      total: result.total 
    },
  });
});
