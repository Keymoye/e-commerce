"use client";

import { useState } from "react";
import { useUIStore } from '@/store/uiStore';
import { createAdminProduct } from "@/services/admin/product";

export default function CreateProductForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const showToast = useUIStore((s) => s.showToast);
  const [form, setForm] = useState({
    name: "",
    base_price_kes: 0,
    stock: 0,
    category_id: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAdminProduct({
        ...form,
        base_price_kes: Math.round(form.base_price_kes * 100),
      });
      showToast({ type: 'success', message: 'The product has been added.' });
      onSuccess(); // Refresh table or page
      setForm({ name: "", base_price_kes: 0, stock: 0, category_id: "" });
    } catch (err: unknown) {
      showToast({ type: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Price (KES)"
        value={form.base_price_kes / 100}
        onChange={(e) => setForm({ ...form, base_price_kes: Number(e.target.value) })}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Stock"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
        className="w-full border p-2 rounded"
      />
      <input
        placeholder="Category ID"
        value={form.category_id}
        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
        className="w-full border p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
