import { createServerClient } from '@/lib/db/server';
import { createAdminSupabase } from '@/lib/db/admin';
import { AppError } from '@/errors/base-error';
import { logger } from '@/lib/logger';
import type { AdminOrder, AdminOrdersResult, AdminOrderFilters, OrderStatus } from '@/types/product';

export const adminOrderService = {

  async getOrders(filters: AdminOrderFilters): Promise<AdminOrdersResult> {
    const { page, pageSize, search, status, dateFrom, dateTo } = filters;
    logger.debug({ message: 'Fetching admin orders', ...filters });

    const supabase = await createServerClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // First fetch orders without user join
    let query = supabase
      .from('orders')
      .select(`
        id, order_number, status, currency,
        subtotal_kes, shipping_fee_kes, total_kes,
        shipping_name, shipping_phone,
        shipping_line_1, shipping_line_2,
        shipping_city, shipping_county, shipping_country,
        created_at, cancelled_at,
        user_id
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search?.trim()) {
      query = query.or(
        `order_number.ilike.%${search.trim()}%` 
      );
    }
    if (status) query = query.eq('status', status);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59Z');

    const { data: ordersData, count, error } = await query;

    if (error) {
      logger.error({ message: 'Failed to fetch admin orders', error: error.message });
      throw AppError.database('Failed to fetch orders');
    }

    // If no orders, return early
    if (!ordersData?.length) {
      return {
        orders: [],
        totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
        total: count ?? 0,
      };
    }

    // Fetch user emails for all orders
    const userIds = ordersData.map(o => o.user_id);
    const adminSupabase = createAdminSupabase();
    const { data: usersData } = await adminSupabase.auth.admin.listUsers();
    const users = usersData.users.filter(u => userIds.includes(u.id));

    // Combine orders with user emails
    const orders = ordersData.map(order => ({
      ...order,
      auth_users: {
        email: users.find(u => u.id === order.user_id)?.email ?? '—'
      }
    }));

    return {
      orders: orders as unknown as AdminOrder[],
      totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      total: count ?? 0,
    };
  },

  async getOrderById(id: string): Promise<AdminOrder> {
    logger.debug({ message: 'Fetching admin order by ID', orderId: id });
    const supabase = await createServerClient();

    // Fetch order with items
    const { data: orderData, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, currency,
        subtotal_kes, shipping_fee_kes, total_kes,
        shipping_name, shipping_phone,
        shipping_line_1, shipping_line_2,
        shipping_city, shipping_county, shipping_country,
        created_at, cancelled_at,
        user_id,
        order_items (
          id, product_id, product_name, variant_name,
          quantity, unit_price_kes, total_kes
        )
      `)
      .eq('id', id)
      .single();

    if (error || !orderData) {
      logger.error({ message: 'Failed to fetch admin order', orderId: id });
      throw AppError.notFound('Order not found');
    }

    // Fetch user email
    const adminSupabase = createAdminSupabase();
    const { data: usersData } = await adminSupabase.auth.admin.listUsers();
    const user = usersData.users.find(u => u.id === orderData.user_id);

    const order = {
      ...orderData,
      auth_users: {
        email: user?.email ?? '—'
      }
    };

    return order as unknown as AdminOrder;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    logger.debug({ message: 'Updating order status', orderId: id, status });
    const supabase = await createServerClient();

    const update: Record<string, unknown> = { status };
    if (status === 'cancelled') update.cancelled_at = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update(update)
      .eq('id', id);

    if (error) {
      logger.error({ message: 'Failed to update order status', orderId: id, error: error.message });
      throw AppError.database('Failed to update order status');
    }

    logger.info({ message: 'Order status updated', orderId: id, status });
  },
};

export function createAdminOrderService() {
  return adminOrderService;
}

export const getAdminOrders = (filters: AdminOrderFilters) =>
  adminOrderService.getOrders(filters);
export const getAdminOrderById = (id: string) =>
  adminOrderService.getOrderById(id);
