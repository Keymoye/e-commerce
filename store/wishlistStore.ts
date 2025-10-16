"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  clear: () => void;
}

export const WishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set((state) =>
          state.items.some((p) => p.id === product.id)
            ? state
            : { items: [...state.items, product] }
        ),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((p) => p.id !== id),
        })),

      toggleWishlist: (product) => {
        const { isWishlisted, addItem, removeItem } = get();
        isWishlisted(product.id) ? removeItem(product.id) : addItem(product);
      },

      isWishlisted: (id) => get().items.some((p) => p.id === id),

      clear: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage", // localStorage key
    }
  )
);
