import { getAdminOrders } from "@/services/admin/orders";
import OrdersTable from "@/components/features/admin/orders-table";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page ?? 1);
  const pageSize = 10;

  const { orders, totalPages } = await getAdminOrders(page, pageSize);

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 text-foreground">Orders</h2>

      <OrdersTable
        orders={orders}
        currentPage={page}
        totalPages={totalPages}
      />
    </section>
  );
}
