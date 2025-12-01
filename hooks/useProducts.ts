import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types/product";
import { products as mockProducts } from "@/lib/products";

export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const search = useSearchParams();

  useEffect(() => {
    // Simulate fetching from an API — replace with fetch to `/api/products` when available
    const timeout = setTimeout(() => {
      const category = search?.get("category") ?? undefined;
      const filtered =
        category && category !== "all"
          ? mockProducts.filter((p) => p.category === category)
          : mockProducts;

      setData(filtered);
      setLoading(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [search]);

  return { data, loading };
}
