'use client';
import { useState, useEffect, useCallback } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useUIStore } from '@/store/uiStore';
import { isApiError } from '@/types/api.types';
import type { Product, CategoryStats } from '@/types/product';

interface UseProductsOptions {
  page:      number;
  pageSize:  number;
  category?: string;
  search?:   string;
  sortBy?:   'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export function usePaginatedProducts(opts: UseProductsOptions) {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const { handleError }             = useErrorHandler();
  const { setLoading, isLoading }   = useUIStore();
  const LOADING_KEY = 'products.list';

  const fetchProducts = useCallback(async () => {
    setLoading(LOADING_KEY, true);
    try {
      const params = new URLSearchParams();
      params.set('page',     String(opts.page));
      params.set('pageSize', String(opts.pageSize));
      if (opts.category) params.set('category', opts.category);
      if (opts.search)   params.set('q', opts.search);
      if (opts.sortBy)   params.set('sortBy', opts.sortBy);

      const res  = await fetch(`/api/products?${params}`);
      const json = await res.json();

      if (isApiError(json)) { handleError(json); return; }

      setProducts(json.data ?? []);
      setTotalPages(json.meta?.totalPages ?? 1);
      setTotal(json.meta?.total ?? 0);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(LOADING_KEY, false);
    }
  }, [opts.page, opts.pageSize, opts.category, opts.search, opts.sortBy]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products, totalPages, total, isLoading: isLoading(LOADING_KEY), refetch: fetchProducts };
}

export function useProductById(id: string) {
  const [product, setProduct]     = useState<Product | null>(null);
  const { handleError }           = useErrorHandler();
  const { setLoading, isLoading } = useUIStore();
  const LOADING_KEY = `products.detail.${id}`;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(LOADING_KEY, true);

    (async () => {
      try {
        const res  = await fetch(`/api/products/${id}`);
        const json = await res.json();
        if (cancelled) return;
        if (isApiError(json)) { handleError(json); return; }
        setProduct(json.data);
      } catch (err) {
        if (!cancelled) handleError(err);
      } finally {
        if (!cancelled) setLoading(LOADING_KEY, false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  return { product, isLoading: isLoading(LOADING_KEY) };
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const { handleError }             = useErrorHandler();
  const { setLoading, isLoading }   = useUIStore();
  const LOADING_KEY = 'categories.list';

  useEffect(() => {
    let cancelled = false;
    setLoading(LOADING_KEY, true);

    (async () => {
      try {
        const res  = await fetch('/api/categories');
        const json = await res.json();
        if (cancelled) return;
        if (isApiError(json)) { handleError(json); return; }
        setCategories(json.data ?? []);
      } catch (err) {
        if (!cancelled) handleError(err);
      } finally {
        if (!cancelled) setLoading(LOADING_KEY, false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { categories, isLoading: isLoading(LOADING_KEY) };
}
