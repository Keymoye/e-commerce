// hooks/useWishlist.ts
"use client";

import { WishlistStore } from "@/store/wishlist-store";
import { Product } from "@/types/product";
import { useUIStore } from '@/store/ui-store';

export function useWishlist(product?: Product) {
  const items = WishlistStore((s) => s.items);
  const addItem = WishlistStore((s) => s.addItem);
  const removeItem = WishlistStore((s) => s.removeItem);
  const toggleWishlistStore = WishlistStore((s) => s.toggleWishlist);
  const clear = WishlistStore((s) => s.clear);

  const showToast = useUIStore((s) => s.showToast);

  const isWishlisted = product ? items.some((p) => p.id === product.id) : false;

  const handleToggle = () => {
    if (!product) return;

    toggleWishlistStore(product);

    showToast({
      type: isWishlisted ? 'info' : 'success',
      message: isWishlisted
        ? `${product.name} removed from wishlist.`
        : `${product.name} added to wishlist.`,
    });
  };

  const handleRemove = (id: string) => {
    removeItem(id);
    showToast({
      type: 'info',
      message: 'Item removed from your wishlist.',
    });
  };

  return {
    items,
    isWishlisted,
    handleToggle,
    handleRemove,
    clear,
  };
}
