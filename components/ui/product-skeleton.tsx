"use client";

import { motion } from "framer-motion";

export default function ProductSkeleton() {
  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-primary rounded-2xl shadow-sm flex flex-col items-stretch animate-pulse"
    >
      {/* Image placeholder */}
      <div className="relative w-full aspect-[4/3] bg-secondary/30 rounded-lg mb-3 shimmer" />

      {/* Title + brand */}
      <div className="h-4 bg-secondary/30 rounded w-3/4 mb-2" />
      <div className="h-3 bg-secondary/20 rounded w-1/2 mb-4" />

      {/* Description lines */}
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-secondary/20 rounded w-full" />
        <div className="h-3 bg-secondary/20 rounded w-5/6" />
      </div>

      {/* Price + rating placeholder */}
      <div className="flex items-center justify-between mt-auto">
        <div className="h-4 w-24 bg-secondary/30 rounded" />
        <div className="h-5 w-12 bg-secondary/30 rounded" />
      </div>
    </motion.article>
  );
}
