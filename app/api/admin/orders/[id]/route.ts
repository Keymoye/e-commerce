import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/errors/error-handler';
import { AppError } from '@/errors/base-error';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { isAdmin } from '@/lib/auth/permissions';
import { adminOrderService } from '@/services/admin/orders';

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

export const GET = withErrorHandler(async (req: NextRequest, ctx: any) => {
  const admin = await isAdmin();
  if (!admin) throw AppError.forbidden('Admin access required');
  const { id } = await ctx.params as { id: string };
  const order = await adminOrderService.getOrderById(id);
  logger.info({ message: 'Admin order fetched', orderId: id });
  return NextResponse.json(order);
});

export const PATCH = withErrorHandler(async (req: NextRequest, ctx: any) => {
  const admin = await isAdmin();
  if (!admin) throw AppError.forbidden('Admin access required');
  const { id } = await ctx.params as { id: string };
  const body = await req.json();
  const { status } = updateStatusSchema.parse(body);
  await adminOrderService.updateStatus(id, status);
  logger.info({ message: 'Admin order status updated', orderId: id, status });
  return NextResponse.json({ success: true, status });
});
