"use client";
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { products as mockProducts } from "@/lib/products";

export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate network latency a tiny bit
    const t = setTimeout(() => {
      setData(mockProducts);
      setLoading(false);
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return { data, loading };
}
