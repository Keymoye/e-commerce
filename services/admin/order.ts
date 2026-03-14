// services/admin/order.ts
import { createServerClient } from '@/lib/supabase/server';
import { AppError } from '@/errors/AppError';
import { logger } from '@/logger';

export const adminOrderService = {
  async getOrders(page: number, pageSize: number) {
    logger.debug({ message: 'Fetching admin orders', page, pageSize });
    
    const supabase = await createServerClient();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
      .from("orders")
      .select(`
        *,
        user_profiles!inner (
          email
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      logger.error({ message: 'Failed to fetch admin orders', error: error.message });
      throw AppError.database('Failed to fetch orders');
    }

    const result = {
      orders: data ?? [],
      totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    };

    logger.info({ message: 'Admin orders fetched successfully', count: result.orders.length, totalPages: result.totalPages });
    return result;
  },
};

// Export factory function for dependency injection
export function createAdminOrderService() {
  return adminOrderService;
}

// Legacy export for backward compatibility
export const getAdminOrders = adminOrderService.getOrders;
