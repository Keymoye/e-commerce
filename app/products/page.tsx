// app/products/page.tsx
"use client";

import ProductsHub from "@/components/products/ProductsHub";

export default function ProductsPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shop</h1>
      <ProductsHub mode="full" initialPage={1} pageSize={12} />
    </main>
  );
}
