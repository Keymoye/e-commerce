// hooks/useWishlist.ts
"use client";

import { WishlistStore } from "@/store/wishlistStore";
import { Product } from "@/types/product";
import { useToast } from "@/components/ui/toast";

export function useWishlist(product?: Product) {
  const items = WishlistStore((s) => s.items);
  const addItem = WishlistStore((s) => s.addItem);
  const removeItem = WishlistStore((s) => s.removeItem);
  const toggleWishlistStore = WishlistStore((s) => s.toggleWishlist);
  const clear = WishlistStore((s) => s.clear);

  const { toast } = useToast();

  const isWishlisted = product ? items.some((p) => p.id === product.id) : false;

  const handleToggle = () => {
    if (!product) return;

    toggleWishlistStore(product);

    toast({
      title: isWishlisted ? "Removed 💔" : "Saved ❤️",
      description: isWishlisted
        ? `${product.name} removed from wishlist.`
        : `${product.name} added to wishlist.`,
      duration: 2000,
    });
  };

  const handleRemove = (id: string) => {
    removeItem(id);
    toast({
      title: "Removed 💔",
      description: "Item removed from your wishlist.",
      duration: 2000,
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
