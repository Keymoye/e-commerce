// app/products/page.tsx
"use client";

import ProductsHub from "@/components/features/products/products-hub";
import { ErrorBoundary } from "@/components/ui/error-boundary";

function ProductsFallback() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center my-8">
      <p className="font-medium text-red-700">Failed to load products.</p>
      <p className="text-sm text-red-500 mt-1">Please refresh the page to try again.</p>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shop</h1>
      <ErrorBoundary fallback={<ProductsFallback />}>
        <ProductsHub mode="full" initialPage={1} pageSize={12} />
      </ErrorBoundary>
    </main>
  );
}
