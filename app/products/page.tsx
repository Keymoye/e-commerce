"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import ProductSkeleton from "@/components/ui/productSkeleton";
import logger from "@/lib/logger";
import type { Product } from "@/types/product";
import { motion } from "framer-motion";

const ProductCard = dynamic(() => import("@/components/ui/productCard"), {
  loading: () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  ),
});

export default function ProductsPage() {
  const { data: products, loading } = useProducts();
  const [sortBy, setSortBy] = useState<
    "price-asc" | "price-desc" | "rating" | "newest"
  >("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  logger.debug("Products page", { loading, count: products?.length ?? 0 });

  const categories = useMemo(
    () => ["all", ...new Set(products?.map((p) => p.category) ?? [])],
    [products]
  );

  const filtered = useMemo(() => {
    let result = products ?? [];

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "newest":
      default:
        // Assume order in products array is newest
        break;
    }

    return result;
  }, [products, categoryFilter, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    logger.warn("No products available");
    return (
      <div className="flex justify-center items-center h-[60vh] text-foreground/60">
        No products available 🛒
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6">
      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-primary/10 p-4 rounded-lg shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-foreground/20 bg-background focus:ring-2 focus:ring-accent outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-foreground/20 bg-background focus:ring-2 focus:ring-accent outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-foreground/20 bg-background focus:ring-2 focus:ring-accent outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-foreground/60 mt-3">
          Showing {filtered.length} of {products.length} products
        </p>
      </motion.div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="flex justify-center items-center h-[40vh] text-foreground/60">
          No products match your filters 🔍
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {filtered.map((p: Product) => (
            <motion.div key={p.id} layout>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
