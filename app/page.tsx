"use client";
import ProductCard from "@/components/ui/productCard";
import { useProducts } from "@/hooks/useProducts";

export default function HomePage() {
  const { data: products, loading } = useProducts();

  if (loading) return <div>Loading...</div>;

  return (
    <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </main>
  );
}
