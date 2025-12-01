// hooks/useCart.ts
"use client";

import { useCallback, useMemo } from "react";
import { CartStore } from "@/store/cartStore";
import { Product } from "@/types/product";
import { useToast } from "@/components/ui/toast";

export function useCart(product?: Product) {
  const { toast } = useToast();

  /** ---- GLOBAL STORE SELECTORS (memoized automatically by Zustand) ---- */
  const items = CartStore((s) => s.items);
  const total = CartStore((s) => s.total);
  const itemCount = CartStore((s) => s.itemCount);

  const addItem = CartStore((s) => s.addItem);
  const updateQuantity = CartStore((s) => s.updateQuantity);
  const removeItem = CartStore((s) => s.removeItem);
  const clear = CartStore((s) => s.clear);

  /** ---- PRODUCT-SPECIFIC DATA (memoized) ---- */
  const cartItem = useMemo(
    () => (product ? items.find((i) => i.id === product.id) : undefined),
    [items, product]
  );

  const quantity = cartItem?.quantity ?? 0;

  /** ---- ACTION HELPERS (stable with useCallback) ---- */

  const handleAdd = useCallback(
    (qty: number = 1) => {
      if (!product) return;
      addItem(product, qty);

      toast({
        title: "Added to cart 🛒",
        description: `${product.name} x${qty} added to your cart.`,
        duration: 1800,
      });
    },
    [product, addItem, toast]
  );

  const handleRemove = useCallback(() => {
    if (!product) return;
    removeItem(product.id);

    toast({
      title: "Removed from cart 🗑️",
      description: `${product.name} removed from your cart.`,
      duration: 1800,
    });
  }, [product, removeItem, toast]);

  const handleIncrease = useCallback(() => {
    if (!product) return;
    const newQty = quantity + 1;

    updateQuantity(product.id, newQty);

    toast({
      title: "Quantity Updated",
      description: `${product.name} → ${newQty}`,
      duration: 1600,
    });
  }, [product, quantity, updateQuantity, toast]);

  const handleDecrease = useCallback(() => {
    if (!product) return;

    if (quantity <= 1) {
      handleRemove();
      return;
    }

    const newQty = quantity - 1;
    updateQuantity(product.id, newQty);

    toast({
      title: "Quantity Updated",
      description: `${product.name} → ${newQty}`,
      duration: 1600,
    });
  }, [product, quantity, updateQuantity, handleRemove, toast]);

  /** ---- EXPORTED API ---- */
  return {
    // GLOBAL CART STATE
    items,
    total,
    itemCount,
    clear,

    // PRODUCT-SPECIFIC STATE
    cartItem,
    quantity,

    // ACTIONS
    handleAdd,
    handleRemove,
    handleIncrease,
    handleDecrease,
  };
}
