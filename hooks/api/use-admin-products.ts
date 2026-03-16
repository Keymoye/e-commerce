import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui-store';
import type { CreateProductInput, UpdateProductInput } from '@/services/admin/product-schemas';
import type { ImageItem } from '@/types/product';

export function useAdminProducts() {
  const router = useRouter();
  const showToast = useUIStore((s) => s.showToast);

  const createProduct = async (input: CreateProductInput) => {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? 'Failed to create product');
    }
    return res.json();
  };

  const updateProduct = async (id: string, input: UpdateProductInput) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? 'Failed to update product');
    }
    return res.json();
  };

  const deleteProduct = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? 'Failed to delete product');
    }
  };

  const uploadImage = async (file: File): Promise<ImageItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? 'Upload failed');
    }
    const { url } = await res.json();
    return { url };
  };

  const submitCreate = async (input: CreateProductInput) => {
    const product = await createProduct(input);
    showToast({ type: 'success', message: `"${product.name}" added to the catalogue.` });
    router.push('/admin/products');
    router.refresh();
    return product;
  };

  const submitUpdate = async (id: string, input: UpdateProductInput) => {
    const product = await updateProduct(id, input);
    showToast({ type: 'success', message: 'Changes saved successfully.' });
    router.push('/admin/products');
    router.refresh();
    return product;
  };

  const submitDelete = async (id: string, name: string) => {
    await deleteProduct(id);
    showToast({ type: 'success', message: `"${name}" has been deleted.` });
    router.refresh();
  };

  return { submitCreate, submitUpdate, submitDelete, uploadImage };
}
