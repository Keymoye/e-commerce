"use client";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Product } from "@/types/product";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;

  // Derived values
  total: number;
  itemCount: number;
}

// 🧠 Utility function for derived values
const calculateTotals = (items: CartItem[]) => ({
  total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
});

// 🧩 Zustand store
export const CartStore = create<CartState>()(
  devtools(
    persist(
      (set) => ({
        items: [],
        total: 0,
        itemCount: 0,

        addItem: (product, quantity = 1) =>
          set((state) => {
            const existing = state.items.find((i) => i.id === product.id);
            let newItems;

            if (existing) {
              newItems = state.items.map((i) =>
                i.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              );
            } else {
              newItems = [
                ...state.items,
                {
                  id: product.id,
                  name: product.name,
                  price: product.base_price_kes / 100,
                  image_url: product.images?.[0]?.url || "/5.webp",
                  quantity,
                },
              ];
            }

            const { total, itemCount } = calculateTotals(newItems);
            return { items: newItems, total, itemCount };
          }),

        updateQuantity: (id, quantity) =>
          set((state) => {
            const newItems = state.items.map((i) =>
              i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
            );
            const { total, itemCount } = calculateTotals(newItems);
            return { items: newItems, total, itemCount };
          }),

        removeItem: (id) =>
          set((state) => {
            const newItems = state.items.filter((i) => i.id !== id);
            const { total, itemCount } = calculateTotals(newItems);
            return { items: newItems, total, itemCount };
          }),

        clear: () =>
          set(() => ({
            items: [],
            total: 0,
            itemCount: 0,
          })),
      }),
      { name: "cart-storage" } // 🧊 persisted in localStorage
    )
  )
);
