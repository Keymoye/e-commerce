// src/store/wishlistStore.ts
import { create } from "zustand";
import { Product } from "@/types/product";

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  remove: (id: string) => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  toggleWishlist: (product) => {
    const exists = get().items.some((i) => i.id === product.id);
    if (exists) set({ items: get().items.filter((i) => i.id !== product.id) });
    else set({ items: [...get().items, product] });
  },
  isWishlisted: (id) => get().items.some((i) => i.id === id),
  remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
}));
