import { useState } from "react";
import { Product } from "@/types/product";
import { products as mockProducts } from "@/lib/products";

export function useProducts() {
  const [data] = useState<Product[]>(mockProducts);

  return { data, loading: false };
}
