"use client";
import ProductCard from "@/components/ui/productCard";
import { useProducts } from "@/hooks/useProducts";

export default function HomePage() {
  const { data: products, loading } = useProducts();

  return (
    <main className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </main>
  );
}
