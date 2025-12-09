"use client";

import { useState, useEffect } from "react";
import type { Product, CategoryStats } from "@/types/product";
import {
  getPaginatedProducts,
  getProductById,
  getCategoriesStats,
} from "@/services/products";

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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Fetch products
    (async () => {
      try {
        const res = await getPaginatedProducts(
          page,
          pageSize,
          category,
          search,
          sortBy
        );
        if (cancelled) return;

        setProducts(res.products ?? []);
        setTotalPages(res.totalPages ?? 1);
        setTotal(res.total ?? 0);
      } catch (err: any) {
        if (cancelled) return;
        console.error("usePaginatedProducts error:", err);
        setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, category, search, sortBy]);

  return { products, totalPages, total, loading, error };
}

export function useProductById(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getProductById(id);
        if (cancelled) return;
        setProduct(res);
      } catch (err: any) {
        if (cancelled) return;
        console.error("useProductById error:", err);
        setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const cats = await getCategoriesStats();
        if (cancelled) return;
        setCategories(cats);
      } catch (err: any) {
        if (cancelled) return;
        console.error("useCategories error:", err);
        setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}
