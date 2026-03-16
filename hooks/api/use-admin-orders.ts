'use client';

import { useUIStore } from '@/store/ui-store';
import type { OrderStatus } from '@/types/product';

export function useAdminOrders() {
  const showToast = useUIStore((s) => s.showToast);

  const updateStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? 'Failed to update status');
      }

      showToast({ type: 'success', message: `Order marked as ${status}` });
      return true;
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update order status',
      });
      return false;
    }
  };

  return { updateStatus };
}
