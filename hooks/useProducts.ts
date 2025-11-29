import { Product } from "@/types/product";
import { products as mockProducts } from "@/lib/products";

export function useProducts() {
  const [data] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);

  return { data, loading };
}

