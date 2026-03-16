import { getAdminOrders } from '@/services/admin/orders';
import OrdersTable from '@/components/features/admin/orders-table';
import type { AdminOrderFilters, OrderStatus } from '@/types/product';

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters: AdminOrderFilters = {
    page:     Number(sp.page ?? '1'),
    pageSize: 10,
    search:   sp.search ?? '',
    status:   (sp.status ?? '') as OrderStatus | '',
    dateFrom: sp.dateFrom ?? '',
    dateTo:   sp.dateTo ?? '',
  };

  const { orders, totalPages, total } = await getAdminOrders(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">{total} total orders</p>
        </div>
      </div>
      <OrdersTable
        orders={orders}
        currentPage={filters.page}
        totalPages={totalPages}
        filters={filters}
      />
    </div>
  );
}
