"use client";

import { useCategories } from "@/hooks/useProducts";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CategoriesClient() {
  const { categories, loading, error } = useCategories();
  const router = useRouter();

  if (loading) return <p>Loading categories...</p>;
  if (error)
    return <p className="text-red-500">Failed to load categories: {error}</p>;

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

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      >
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            layout
            role="button"
            aria-label={`View all products in ${cat.name}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() =>
              router.push(`/products?category=${encodeURIComponent(cat.name)}`)
            }
            className="bg-primary p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all flex flex-col justify-between min-h-[200px]"
          >
            <div className="text-4xl mb-3">{getCategoryIcon(cat.name)}</div>
            <h3 className="font-semibold text-lg mb-2 truncate">{cat.name}</h3>
            <p className="text-sm text-foreground/70 truncate">
              <span className="font-semibold text-accent">{cat.count}</span>{" "}
              products • Avg. Price:{" "}
              <span className="font-semibold">${cat.avgPrice.toFixed(2)}</span>
            </p>
            <div className="mt-4 text-secondary hover:text-accent transition-colors">
              View All →
            </div>
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
