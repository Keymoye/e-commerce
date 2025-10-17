"use client";

import ProductSkeleton from "@/components/ui/productSkeleton";

export default function Loading() {
  return (
    <section className="grid gap-4 p-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </section>
  );
}
