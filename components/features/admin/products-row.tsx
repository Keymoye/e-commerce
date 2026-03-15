"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useUIStore } from '@/store/uiStore';

export default function ProductsRow({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const showToast = useUIStore((s) => s.showToast);
  
  const handleDelete = async () => {
    if (!confirm(`Delete product "${product.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }

      showToast({ type: 'success', message: 'Product deleted successfully' });
      router.refresh(); // refresh the page to show updated data
    } catch (err) {
      showToast({ type: 'error', message: err instanceof Error ? err.message : 'Delete failed' });
    }
  };

  return (
    <>
      <td className="p-3 font-medium text-gray-900">{product.name}</td>
      <td className="p-3 text-center text-gray-500">{product.category?.name || 'Uncategorized'}</td>
      <td className="p-3 text-center text-gray-900">${(product.base_price_kes / 100).toFixed(2)}</td>
      <td className="p-3 text-center">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          product.stock > 0 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.stock > 0 ? "In stock" : "Out"}
        </span>
      </td>
      <td className="p-3 text-center space-x-2">
        <Link
          href={`/admin/products/${product.id}`}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:underline text-sm font-medium"
        >
          Delete
        </button>
      </td>
    </>
  );
}
