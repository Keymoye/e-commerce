"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/types/product";
import { getPaginatedProducts, getProductById } from "@/services/products";

interface UseProductsOptions {
  page: number;
  pageSize: number;
  category?: string;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "rating" | "newest";
}

export function usePaginatedProducts({
  page,
  pageSize,
  category,
  search,
  sortBy,
}: UseProductsOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPaginatedProducts(page, pageSize, category, search, sortBy)
      .then((res) => {
        if (cancelled) return;
        setProducts(res.products ?? []);
        setTotalPages(res.totalPages ?? 1);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, category, search, sortBy]);

  return { products, totalPages, loading, error };
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
