'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useOptimistic, useState } from 'react';
import Link from 'next/link';
import Pagination from './admin-pagination';
import { useAdminOrders } from '@/hooks/api/use-admin-orders';
import { ORDER_STATUS_COLORS } from '@/lib/utils/format';
import type { AdminOrder, AdminOrderFilters, OrderStatus } from '@/types/product';

const ORDER_STATUSES: OrderStatus[] = [
  'pending', 'processing', 'shipped', 'delivered', 'cancelled',
];

interface Props {
  orders: AdminOrder[];
  currentPage: number;
  totalPages: number;
  filters: AdminOrderFilters;
}

export default function OrdersTable({ orders, currentPage, totalPages, filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { updateStatus } = useAdminOrders();

  const [optimisticOrders, updateOptimistic] = useOptimistic(
    orders,
    (state: AdminOrder[], { id, status }: { id: string; status: OrderStatus }) =>
      state.map((o) => (o.id === id ? { ...o, status } : o))
  );

  const pushFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value); else params.delete(key);
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    updateOptimistic({ id: orderId, status });
    const ok = await updateStatus(orderId, status);
    if (ok) router.refresh();
  };

  // Empty state
  if (orders.length === 0 && !filters.search && !filters.status && !filters.dateFrom) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-sm text-gray-500">Orders will appear here when customers make purchases.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Search + filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Order # or customer email"
            defaultValue={filters.search}
            onChange={(e) => {
              const v = e.target.value;
              clearTimeout((window as any).__orderSearchTimer);
              (window as any).__orderSearchTimer = setTimeout(() => pushFilter('search', v), 400);
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            defaultValue={filters.status ?? ''}
            onChange={(e) => pushFilter('status', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
          <input
            type="date"
            defaultValue={filters.dateFrom}
            onChange={(e) => pushFilter('dateFrom', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
          <input
            type="date"
            defaultValue={filters.dateTo}
            onChange={(e) => pushFilter('dateTo', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
        </div>

        {(filters.search || filters.status || filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => router.push(pathname)}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* No results (with active filters) */}
      {optimisticOrders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500 text-sm">No orders match your filters.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full text-sm" role="table" aria-label="Admin orders">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left font-medium text-gray-700">Order #</th>
                  <th className="p-3 text-left font-medium text-gray-700">Customer</th>
                  <th className="p-3 text-center font-medium text-gray-700">Status</th>
                  <th className="p-3 text-right font-medium text-gray-700">Total</th>
                  <th className="p-3 text-left font-medium text-gray-700">Date</th>
                  <th className="p-3 text-center font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {optimisticOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`border-t transition-colors ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50`}
                  >
                    <td className="p-3 font-mono text-xs text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="p-3 text-gray-600 text-xs">
                      {order.auth_users?.email ?? '—'}
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                          ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-right font-medium text-gray-900">
                      KES {(order.total_kes / 100).toLocaleString()}
                    </td>
                    <td className="p-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination current={currentPage} total={totalPages} />
        </>
      )}
    </div>
  );
}
