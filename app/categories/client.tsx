"use client";

import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CategoriesClient() {
  const { data: products } = useProducts();
  const router = useRouter();

  const categories = useMemo(() => {
    const categoryMap = new Map<
      string,
      { count: number; avgPrice: number; icon: string }
    >();

    products?.forEach((p: Product) => {
      const cat = p.category || "Uncategorized";
      const existing = categoryMap.get(cat) || {
        count: 0,
        avgPrice: 0,
        icon: "📦",
      };

      const newCount = existing.count + 1;
      const newAvgPrice =
        (existing.avgPrice * existing.count + p.price) / newCount;

      categoryMap.set(cat, {
        count: newCount,
        avgPrice: newAvgPrice,
        icon: getCategoryIcon(cat),
      });
    });

    return Array.from(categoryMap, ([name, data]) => ({ name, ...data })).sort(
      (a, b) => b.count - a.count
    );
  }, [products]);

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold mb-2"
      >
        Browse Categories
      </motion.h1>
      <p className="text-foreground/70 mb-8">
        Explore our {categories.length} product categories
      </p>

      <motion.div layout className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() =>
              router.push(`/products?category=${encodeURIComponent(cat.name)}`)
            }
            className="bg-primary p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="text-4xl mb-3">{cat.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{cat.name}</h3>

            <div className="space-y-2 text-sm text-foreground/70">
              <p>
                <span className="font-semibold text-accent">{cat.count}</span>{" "}
                products
              </p>
              <p>
                Avg. Price:{" "}
                <span className="font-semibold">
                  ${cat.avgPrice.toFixed(2)}
                </span>
              </p>
            </div>

            <motion.div
              whileHover={{ x: 5 }}
              className="mt-4 text-secondary hover:text-accent transition-colors"
            >
              View All →
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "Pain Relief & Anti-inflammatory": "💊",
    Supplements: "🧪",
    "Beauty & Skincare": "💅",
    Vitamins: "🥗",
    "Cold & Flu": "🤒",
    "Digestive Health": "🫒",
    default: "📦",
  };

  return icons[category] || icons.default;
}
