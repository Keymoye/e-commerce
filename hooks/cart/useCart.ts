// hooks/useCart.ts
"use client";

import { useCallback, useMemo } from "react";
import { CartStore } from "@/store/cartStore";
import { Product } from "@/types/product";
import { useToast } from "@/components/ui/toast";

export function useCart(product?: Product, id?: string) {
  const { toast } = useToast();

  /** ---- GLOBAL STORE SELECTORS (memoized automatically by Zustand) ---- */
  const items = CartStore((s) => s.items);
  const addItem = CartStore((s) => s.addItem);
  const updateQuantity = CartStore((s) => s.updateQuantity);
  const removeItem = CartStore((s) => s.removeItem);

  // Find cart item either by product or by id
  const cartItem = useMemo(() => {
    if (product) return items.find((i) => i.id === product.id);
    if (id) return items.find((i) => i.id === id);
    return undefined;
  }, [items, product, id]);

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
    if (!cartItem) return;
    removeItem(cartItem.id);

    toast({
      title: "Removed from cart 🗑️",
      description: `${cartItem.name} removed from your cart.`,
      duration: 1800,
    });
  }, [cartItem, removeItem, toast]);

  const handleIncrease = useCallback(() => {
    if (!cartItem) return;
    const newQty = quantity + 1;

    updateQuantity(cartItem.id, newQty);

    toast({
      title: "Quantity Updated",
      description: `${cartItem.name} → ${newQty}`,
      duration: 1600,
    });
  }, [cartItem, quantity, updateQuantity, toast]);

  const handleDecrease = useCallback(() => {
    if (!cartItem) return;

    if (quantity <= 1) {
      handleRemove();
      return;
    }

    const newQty = quantity - 1;
    updateQuantity(cartItem.id, newQty);

    toast({
      title: "Quantity Updated",
      description: `${cartItem.name} → ${newQty}`,
      duration: 1600,
    });
  }, [cartItem, quantity, updateQuantity, handleRemove, toast]);

  /** ---- EXPORTED API ---- */
  return {
    // GLOBAL CART STATE
    items,

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
