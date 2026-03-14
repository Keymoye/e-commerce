// services/admin/metrics.ts
import { createServerClient } from '@/lib/supabase/server';
import { AppError } from '@/errors/AppError';
import { logger } from '@/logger';

export const adminMetricsService = {
  async getDashboardMetrics() {
    logger.debug({ message: 'Fetching dashboard metrics' });
    
    const supabase = await createServerClient();

    try {
      const [{ count: products }, { count: users }, { count: orders }] =
        await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase.from("user_profiles").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("*", { count: "exact", head: true }),
        ]);

      const metrics = {
        totalProducts: products ?? 0,
        totalUsers: users ?? 0,
        totalOrders: orders ?? 0,
      };

      logger.info({ message: 'Dashboard metrics fetched successfully', metrics });
      return metrics;
    } catch (error) {
      logger.error({ message: 'Failed to fetch dashboard metrics', error: error instanceof Error ? error.message : 'Unknown error' });
      throw AppError.database('Failed to fetch dashboard metrics');
    }
  },
};

// Export factory function for dependency injection
export function createAdminMetricsService() {
  return adminMetricsService;
}

// Legacy export for backward compatibility
export const getDashboardMetrics = adminMetricsService.getDashboardMetrics;
