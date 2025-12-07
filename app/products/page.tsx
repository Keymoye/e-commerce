"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import dynamic from "next/dynamic";
import ProductSkeleton from "@/components/ui/productSkeleton";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";

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
  const [sortBy, setSortBy] = useState<
    "price-asc" | "price-desc" | "rating" | "newest"
  >("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Use the fixed hook with server-side filtering
  const {
    data: products,
    loading,
    error,
  } = useProducts({
    category: categoryFilter === "all" ? undefined : categoryFilter,
    search: searchQuery,
    sortBy,
  });

  const categories = [
    "all",
    "Pain Relief & Anti-inflammatory",
    "Supplements",
    "Beauty & Skincare",
    "Vitamins",
    "Cold & Flu",
    "Digestive Health",
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load products: {error}
      </div>
    );
  }

  if (!products || products.length === 0) {
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
          Showing {products.length} products
        </p>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {products.map((p: Product) => (
          <motion.div key={p.id} layout>
            <ProductCard product={p} />
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
