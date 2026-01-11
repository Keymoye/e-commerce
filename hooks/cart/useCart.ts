// hooks/useCart.ts
"use client";

import { useCallback } from "react";
import { CartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/toast";
import { Product } from "@/types/product";

export function useCart() {
  const { toast } = useToast();

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

      toast({
        title: "Added to cart 🛒",
        description: `${product.name} x${qty} added to your cart.`,
        duration: 1800,
      });
    },
    [addItem, toast]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      removeItem(id);

      toast({
        title: "Removed from cart 🗑️",
        description: `${item.name} removed from your cart.`,
        duration: 1800,
      });
    },
    [items, removeItem, toast]
  );

  const handleIncrease = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const newQty = item.quantity + 1;
      updateQuantity(id, newQty);

      toast({
        title: "Quantity Updated",
        description: `${item.name} → ${newQty}`,
        duration: 1600,
      });
    },
    [items, updateQuantity, toast]
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

      toast({
        title: "Quantity Updated",
        description: `${item.name} → ${newQty}`,
        duration: 1600,
      });
    },
    [items, updateQuantity, handleRemove, toast]
  );

  const handleClear = useCallback(() => {
    clear();
    toast({
      title: "Cart cleared 🗑️",
      description: "All items removed from your cart.",
      duration: 1800,
    });
  }, [clear, toast]);

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
