import type { Product } from "@/types/product";
import Link from "next/link";

export default function ProductsRow({ product }: { product: Product }) {
  return (
    <tr className="border-t hover:bg-muted/50">
      <td className="p-3 font-medium">{product.name}</td>
      <td className="p-3 text-center">{product.category}</td>
      <td className="p-3 text-center">${product.price.toFixed(2)}</td>
      <td className="p-3 text-center">
        {product.stock > 0 ? "In stock" : "Out"}
      </td>
      <td className="p-3 text-center space-x-2">
        <Link
          href={`/admin/products/${product.id}`}
          className="text-primary hover:underline"
        >
          Edit
        </Link>
      </td>
    </tr>
  );
}
