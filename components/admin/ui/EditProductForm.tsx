"use client";

import { useState } from "react";
import { z } from "zod";
import { updateAdminProduct } from "@/services/admin/product";
import { useUIStore } from '@/store/uiStore';
import { useRouter } from "next/navigation";
import { productSchema } from "@/services/admin/product.schemas";

interface Props {
  initialData: z.infer<typeof productSchema>;
}

export default function EditProductForm({ initialData }: Props) {
  const router = useRouter();
  const showToast = useUIStore((s) => s.showToast);
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateAdminProduct(form);
      showToast({ type: 'success', message: 'Product updated successfully' });
      router.push("/admin/products");
    } catch (err) {
      showToast({ type: 'error', message: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label>Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label>Price (KES)</label>
        <input
          type="number"
          value={form.base_price_kes / 100}
          onChange={(e) => handleChange("base_price_kes", Math.round(parseFloat(e.target.value) * 100))}
          className="input"
        />
      </div>
      <div>
        <label>Stock</label>
        <input
          type="number"
          value={form.stock}
          onChange={(e) => handleChange("stock", parseInt(e.target.value))}
          className="input"
        />
      </div>
      <div>
        <label>Category ID</label>
        <input
          type="text"
          value={form.category_id}
          onChange={(e) => handleChange("category_id", e.target.value)}
          className="input"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Updating..." : "Update Product"}
      </button>
    </form>
  );
}
