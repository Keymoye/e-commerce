import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/error-handler';
import { AppError } from '@/errors/base-error';
import { logger } from '@/lib/logger';
import { isAdmin } from '@/lib/auth/permissions';
import { adminOrderService } from '@/services/admin/orders';
import type { AdminOrderFilters } from '@/types/product';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const admin = await isAdmin();
  if (!admin) throw AppError.forbidden('Admin access required');

  const { searchParams } = new URL(req.url);
  const filters: AdminOrderFilters = {
    page:     Number(searchParams.get('page') ?? '1'),
    pageSize: Number(searchParams.get('pageSize') ?? '10'),
    search:   searchParams.get('search') ?? '',
    status:   (searchParams.get('status') ?? '') as AdminOrderFilters['status'],
    dateFrom: searchParams.get('dateFrom') ?? '',
    dateTo:   searchParams.get('dateTo') ?? '',
  };

  const result = await adminOrderService.getOrders(filters);
  logger.info({ message: 'Admin orders fetched', count: result.orders.length });
  return NextResponse.json(result);
});
