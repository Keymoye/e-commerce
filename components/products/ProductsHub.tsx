// components/products/ProductsHub.tsx
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
  | {
      mode: "featured"; // Home: simple limited list (page 1 only)
      limit?: number;
    }
  | {
      mode: "full"; // Products page: paginated with filters
      initialPage?: number;
      pageSize?: number;
    };

export default function ProductsHub(props: ProductsHubProps) {
  if (props.mode === "featured")
    return <FeaturedProducts limit={props.limit ?? 8} />;
  return (
    <FullProducts
      initialPage={props.initialPage ?? 1}
      pageSize={props.pageSize ?? 12}
    />
  );
}

/* ---------------- Featured (Home) ---------------- */
function FeaturedProducts({ limit }: { limit: number }) {
  // Featured uses paginated hook but limited to page=1, pageSize = limit
  const { products, loading } = usePaginatedProducts({
    page: 1,
    pageSize: limit,
    // no filters/search/sort for featured mode (fast path)
  });

  return (
    <section aria-label="Featured products">
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products?.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- Full (Products page) ---------------- */
function FullProducts({
  initialPage,
  pageSize,
}: {
  initialPage: number;
  pageSize: number;
}) {
  // Local UI states
  const [page, setPage] = useState<number>(initialPage);
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "price-asc" | "price-desc" | "rating" | "newest"
  >("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Hook that calls getPaginatedProducts
  const { products, totalPages, loading, error } = usePaginatedProducts({
    page,
    pageSize,
    category: category === "all" ? undefined : category,
    search: debouncedSearch || undefined,
    sortBy,
  });

  // preserve layout: skeleton count equals pageSize so grid doesn't jump
  const skeletonCount = pageSize;

  // Reset to first page on filter change
  useEffect(() => {
    setPage(1);
  }, [category, sortBy, debouncedSearch]);

  const showing = products?.length ?? 0;

  return (
    <section aria-label="Product listing">
      {/* Filters */}
      <div
        className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        role="region"
        aria-label="Product filters"
      >
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

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <>
          <div className="text-sm text-foreground/60 mb-4">
            Showing {showing} products • Page {page} of {totalPages}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p: Product) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-[40vh] text-foreground/60">
          No products found 🔍
        </div>
      )}
      {error && (
        <div className="mt-4 text-center text-red-500">
          Error loading products: {String(error)}
        </div>
      )}
    </section>
  );
}
