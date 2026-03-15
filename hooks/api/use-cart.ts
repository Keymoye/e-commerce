// hooks/useCart.ts
"use client";

import { useCallback } from "react";
import { CartStore } from "@/store/cart-store";
import { useUIStore } from '@/store/ui-store';
import { Product } from "@/types/product";

export function useCart() {
  const showToast = useUIStore((s) => s.showToast);

  /** ---- GLOBAL STORE SELECTORS ---- */
  const items = CartStore((s) => s.items);
  const addItem = CartStore((s) => s.addItem);
  const updateQuantity = CartStore((s) => s.updateQuantity);
  const removeItem = CartStore((s) => s.removeItem);
  const clear = CartStore((s) => s.clear);
  const total = CartStore((s) => s.total);

  /** ---- ACTION HELPERS ---- */

  const handleAdd = useCallback(
    (product: Product, qty: number = 1) => {
      if (!product) return;
      addItem(product, qty);

      showToast({ type: 'success', message: `${product.name} added to cart.` });
    },
    [addItem, showToast]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      removeItem(id);

      showToast({ type: 'info', message: `${item.name} removed from cart.` });
    },
    [items, removeItem, showToast]
  );

  const handleIncrease = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const newQty = item.quantity + 1;
      updateQuantity(id, newQty);

      showToast({ type: 'info', message: `${item.name} → ${newQty}` });
    },
    [items, updateQuantity, showToast]
  );

  const handleDecrease = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      if (item.quantity <= 1) {
        handleRemove(id);
        return;
      }

      const newQty = item.quantity - 1;
      updateQuantity(id, newQty);

      showToast({ type: 'info', message: `${item.name} → ${newQty}` });
    },
    [items, updateQuantity, handleRemove, showToast]
  );

  const handleClear = useCallback(() => {
    clear();
    showToast({ type: 'info', message: 'Cart cleared.' });
  }, [clear, showToast]);

  /** ---- EXPORTED API ---- */
  return {
    items,
    total,
    handleAdd,
    handleRemove,
    handleIncrease,
    handleDecrease,
    handleClear,
  };
}
