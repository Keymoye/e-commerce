"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { createAdminProduct } from "@/services/admin/product";

export default function CreateProductForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    price: 0,
    stock: 0,
    category: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAdminProduct(form);
      toast({
        title: "Product created ✅",
        description: "The product has been added.",
      });
      onSuccess(); // Refresh table or page
      setForm({ name: "", price: 0, stock: 0, category: "" });
    } catch (err: unknown) {
      toast({
        title: "Create failed ⚠️",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
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
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
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
        placeholder="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
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
