"use client";

import ProductCard from "@/components/ui/productCard";
import Loading from "@/app/loading";
import { useProducts } from "@/hooks/useProducts";

export default function HomePage() {
  const { data: products, loading } = useProducts();

  console.log("🌀 Fetching products...", loading);
  console.log("📦 Products fetched:", products);

  if (loading) {
    return <Loading />;
  }

  if (!products || products.length === 0) {
    console.log("⚠️ No products available.");
    return (
      <div className="flex justify-center items-center h-[60vh] text-foreground/60">
        No products available 🛒
      </div>
    );
  }

  return (
    <main className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </main>
  );
}
