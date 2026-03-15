"use client";

import { useState } from "react";
import { z } from "zod";
import { useUIStore } from '@/store/ui-store';
import { useRouter } from "next/navigation";
import { productSchema } from "@/services/admin/product-schemas";

interface Props {
  initialData: z.infer<typeof productSchema>;
}

export default function EditProductForm({ initialData }: Props) {
  const router = useRouter();
  const showToast = useUIStore((s) => s.showToast);
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name || form.name.trim().length === 0) {
      newErrors.name = 'Name is required';
    }

    if (form.base_price_kes < 0) {
      newErrors.base_price_kes = 'Price must be non-negative';
    }

    if (form.stock < 0) {
      newErrors.stock = 'Stock must be non-negative';
    }

    if (!form.category_id || form.category_id.trim().length === 0) {
      newErrors.category_id = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/products/${form.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
      }

      showToast({ type: 'success', message: 'Product updated successfully' });
      router.push("/admin/products");
    } catch (err) {
      showToast({ type: 'error', message: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.name ? 'border-destructive' : ''
          }`}
          placeholder="Enter product name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
          Price (KES)
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={form.base_price_kes / 100}
          onChange={(e) => handleChange("base_price_kes", Math.round(parseFloat(e.target.value) * 100))}
          className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.base_price_kes ? 'border-destructive' : ''
          }`}
          placeholder="0.00"
        />
        {errors.base_price_kes && (
          <p className="mt-1 text-sm text-destructive">{errors.base_price_kes}</p>
        )}
      </div>

      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-foreground mb-2">
          Stock
        </label>
        <input
          id="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
          className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.stock ? 'border-destructive' : ''
          }`}
          placeholder="0"
        />
        {errors.stock && (
          <p className="mt-1 text-sm text-destructive">{errors.stock}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
          Category ID
        </label>
        <input
          id="category"
          type="text"
          value={form.category_id}
          onChange={(e) => handleChange("category_id", e.target.value)}
          className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.category_id ? 'border-destructive' : ''
          }`}
          placeholder="Enter category ID"
        />
        {errors.category_id && (
          <p className="mt-1 text-sm text-destructive">{errors.category_id}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-muted focus:ring-offset-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
