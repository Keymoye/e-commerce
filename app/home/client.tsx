"use client";

import { useProducts } from "@/hooks/useProducts";
import logger from "@/lib/logger";
import type { Product } from "@/types/product";
import dynamic from "next/dynamic";
import Loading from "@/app/loading";
import ProductSkeleton from "@/components/ui/productSkeleton";

const ProductCardClient = dynamic(() => import("@/components/ui/productCard"), {
  loading: () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  ),
});

export default function HomePageClient() {
  const { data: products, loading } = useProducts();

  logger.debug("Fetching products", { loading });

  if (loading) {
    return <Loading />;
  }

  logger.info("Products fetched", { count: products?.length ?? 0 });

  if (!products || products.length === 0) {
    logger.warn("No products available");
    return (
      <div className="flex justify-center items-center h-[60vh] text-foreground/60">
        No products available 🛒
      </div>
    );
  }

  return (
    <main className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-4">
      {products.map((p: Product) => (
        <ProductCardClient key={p.id} product={p} />
      ))}
    </main>
  );
}
