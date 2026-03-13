"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { useUIStore } from '@/store/uiStore';
import { updateAdminProduct } from "@/services/admin/product";

interface Props {
  product: Product;
}

export default function ProductForm({ product }: Props) {
  const showToast = useUIStore((s) => s.showToast);
  const [form, setForm] = useState({
    name: product.name,
    price: product.base_price_kes / 100,
    stock: product.stock,
    category: product.category_id,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateAdminProduct({ 
        ...form, 
        id: product.id,
        base_price_kes: Math.round(form.price * 100),
        category_id: form.category,
      });
      showToast({ type: 'success', message: 'Your changes have been saved.' });
    } catch (err: unknown) {
      showToast({ type: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Price</label>
        <input
          type="number"
          className="w-full border p-2 rounded"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Stock</label>
        <input
          type="number"
          className="w-full border p-2 rounded"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Category ID</label>
        <input
          className="w-full border p-2 rounded"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
