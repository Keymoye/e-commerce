import { deleteAdminProduct } from "@/services/admin/product";
import Link from "next/link";
import { Product } from "@/types/product";

export default function ProductsRow({
  product,
  onDeleted,
}: {
  product: Product;
  onDeleted: () => void;
}) {
  const handleDelete = async () => {
    if (!confirm(`Delete product "${product.name}"?`)) return;
    try {
      await deleteAdminProduct(product.id);
      onDeleted(); // refresh table
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

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
        <button
          onClick={handleDelete}
          className="text-destructive hover:underline"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
