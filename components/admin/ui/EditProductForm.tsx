"use client";

import { useState } from "react";
import { z } from "zod";
import { updateAdminProduct, productSchema } from "@/services/admin/product";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface Props {
  initialData: z.infer<typeof productSchema>;
}

export default function EditProductForm({ initialData }: Props) {
  const router = useRouter();
  const { toast } = useToast();
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
      toast({
        title: "Success",
        description: "Product updated successfully",
        variant: "default",
      });
      router.push("/admin/products");
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Update failed",
        variant: "destructive",
      });
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
        <label>Price</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => handleChange("price", parseFloat(e.target.value))}
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
        <label>Category</label>
        <input
          type="text"
          value={form.category}
          onChange={(e) => handleChange("category", e.target.value)}
          className="input"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Updating..." : "Update Product"}
      </button>
    </form>
  );
}
