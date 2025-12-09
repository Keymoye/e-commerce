"use client";

import React, { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import dynamic from "next/dynamic";
import ProductSkeleton from "@/components/ui/productSkeleton";
import Pagination from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginatedProducts } from "@/hooks/useProducts";
import { motion } from "framer-motion";

const ProductCard = dynamic(() => import("@/components/ui/productCard"), {
  loading: () => <div />,
});

type ProductsHubProps =
  | { mode: "featured"; limit?: number }
  | { mode: "full"; initialPage?: number; pageSize?: number };

export default function ProductsHub(props: ProductsHubProps) {
  return props.mode === "featured" ? (
    <FeaturedProducts limit={props.limit ?? 8} />
  ) : (
    <FullProducts
      initialPage={props.initialPage ?? 1}
      pageSize={props.pageSize ?? 12}
    />
  );
}

/* Featured Products (Home) */
function FeaturedProducts({ limit }: { limit: number }) {
  const { products, loading } = usePaginatedProducts({
    page: 1,
    pageSize: limit,
  });

  return (
    <section aria-label="Featured products">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {loading
          ? Array.from({ length: limit }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
          : products?.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
      </div>
    </section>
  );
}

/* Full Products (Products Page) */
function FullProducts({
  initialPage,
  pageSize,
}: {
  initialPage: number;
  pageSize: number;
}) {
  const [page, setPage] = useState(initialPage);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<
    "price-asc" | "price-desc" | "rating" | "newest"
  >("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { products, totalPages, loading, error } = usePaginatedProducts({
    page,
    pageSize,
    category: category === "all" ? undefined : category,
    search: debouncedSearch || undefined,
    sortBy,
  });

  useEffect(() => setPage(1), [category, sortBy, debouncedSearch]);
  const showing = products?.length ?? 0;

  return (
    <section aria-label="Product listing">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <input
            aria-label="Search products"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full px-3 py-2 rounded-lg border border-foreground/20 bg-background focus:ring-2 focus:ring-accent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-foreground/20 bg-background focus:ring-2 focus:ring-accent outline-none"
          >
            <option value="all">All</option>
            <option value="Pain Relief & Anti-inflammatory">Pain Relief</option>
            <option value="Supplements">Supplements</option>
            <option value="Beauty & Skincare">Beauty</option>
            <option value="Vitamins">Vitamins</option>
            <option value="Cold & Flu">Cold & Flu</option>
            <option value="Digestive Health">Digestive Health</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select
            aria-label="Sort products"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-foreground/20 bg-background focus:ring-2 focus:ring-accent outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {loading
          ? Array.from({ length: pageSize }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
          : products?.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
      </div>

      {/* Showing + Pagination */}
      {!loading && products && products.length > 0 && (
        <>
          <div className="text-sm text-foreground/60 mt-4 mb-2">
            Showing {showing} products • Page {page} of {totalPages}
          </div>
          <div className="flex justify-center mt-2">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && (!products || products.length === 0) && (
        <div className="flex justify-center items-center h-[40vh] text-foreground/60">
          No products found 🔍
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 text-center text-red-500">
          Error loading products: {String(error)}
        </div>
      )}
    </section>
  );
}
