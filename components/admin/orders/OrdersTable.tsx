"use client";

import Pagination from "../products/Pagination";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_kes: number;
  created_at: string;
  user_profiles: {
    email: string;
  };
}

interface Props {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  error?: string | null;
}

export default function OrdersTable({
  orders,
  currentPage,
  totalPages,
  loading = false,
  error = null,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Order #</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-muted rounded animate-pulse mx-auto w-16"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-muted rounded animate-pulse ml-auto w-20"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
        <h3 className="font-medium text-destructive mb-2">Error loading orders</h3>
        <p className="text-sm text-destructive/80">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
        <p className="text-sm text-muted-foreground">Orders will appear here when customers make purchases.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table
          className="min-w-full text-sm"
          role="table"
          aria-label="Admin orders table"
        >
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left font-medium text-foreground">Order #</th>
              <th className="p-3 text-left font-medium text-foreground">Customer</th>
              <th className="p-3 text-center font-medium text-foreground">Status</th>
              <th className="p-3 text-right font-medium text-foreground">Total</th>
              <th className="p-3 text-left font-medium text-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order.id}
                className={`border-t transition-colors ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                } hover:bg-muted/50`}
              >
                <td className="p-3 font-medium text-foreground">{order.order_number}</td>
                <td className="p-3 text-muted-foreground">{order.user_profiles.email}</td>
                <td className="p-3 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-right font-medium text-foreground">
                  ${(order.total_kes / 100).toFixed(2)}
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination current={currentPage} total={totalPages} />
    </div>
  );
}
