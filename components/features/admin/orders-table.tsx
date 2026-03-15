"use client";

import Pagination from "./admin-pagination";

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
  onChange: (page: number) => void;
  loading?: boolean;
  error?: string | null;
}

export default function OrdersTable({
  orders,
  currentPage,
  totalPages,
  onChange,
  loading = false,
  error = null,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
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
                    <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-32"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse mx-auto w-16"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse ml-auto w-20"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-24"></div>
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
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h3 className="font-medium text-red-600 mb-2">Error loading orders</h3>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
        <p className="text-sm text-gray-500">Orders will appear here when customers make purchases.</p>
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
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table
          className="min-w-full text-sm"
          role="table"
          aria-label="Admin orders table"
        >
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-medium text-gray-900">Order #</th>
              <th className="p-3 text-left font-medium text-gray-900">Customer</th>
              <th className="p-3 text-center font-medium text-gray-900">Status</th>
              <th className="p-3 text-right font-medium text-gray-900">Total</th>
              <th className="p-3 text-left font-medium text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order.id}
                className={`border-t transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-gray-100`}
              >
                <td className="p-3 font-medium text-gray-900">{order.order_number}</td>
                <td className="p-3 text-gray-500">{order.user_profiles.email}</td>
                <td className="p-3 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-right font-medium text-gray-900">
                  ${(order.total_kes / 100).toFixed(2)}
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination current={currentPage} total={totalPages} onChange={onChange} />
    </div>
  );
}
