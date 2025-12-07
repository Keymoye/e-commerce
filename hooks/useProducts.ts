"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/types/product";
import { getProducts, getProductById } from "@/services/products";

interface UseProductsOptions {
  category?: string;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "rating" | "newest";
  limit?: number;
}

export function useProducts(options?: UseProductsOptions) {
  const [data, setData] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    getProducts(options)
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [options?.category, options?.search, options?.sortBy, options?.limit]);

  return { data, loading, error };
}

export function useProductById(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getProductById(id)
      .then((res) => setProduct(res))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}
