'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { AdminProduct, ImageItem } from '@/types/product';
import { useAdminProducts } from '@/hooks/api/use-admin-products';

interface Category {
  id: string;
  name: string;
}

interface Props {
  mode: 'create' | 'edit';
  product?: AdminProduct;
  categories: Category[];
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export default function ProductFormPage({ mode, product, categories }: Props) {
  const { submitCreate, submitUpdate, uploadImage } = useAdminProducts();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    base_price_kes: product ? product.base_price_kes / 100 : 0,
    stock: product?.stock ?? 0,
    category_id: product?.category_id ?? '',
    brand: product?.brand ?? '',
    slug: product?.slug ?? '',
    is_active: product?.is_active ?? true,
    tags: product?.tags?.join(', ') ?? '',
  });

  const [images, setImages] = useState<ImageItem[]>(
    product?.images?.map((img) => ({ url: img.url, alt: img.alt })) ?? []
  );

  useEffect(() => {
    if (!slugManuallyEdited && mode === 'create') {
      setForm((prev) => ({ ...prev, slug: slugify(form.name) }));
    }
  }, [form.name, slugManuallyEdited, mode]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const slots: ImageItem[] = Array.from(files).map(() => ({ url: '', uploading: true }));
    setImages((prev) => [...prev, ...slots]);
    const startIdx = images.length;

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadImage(files[i]);
        setImages((prev) => {
          const next = [...prev];
          next[startIdx + i] = { url: result.url, alt: form.name };
          return next;
        });
      } catch {
        setImages((prev) => {
          const next = [...prev];
          next[startIdx + i] = { url: '', error: 'Upload failed' };
          return next;
        });
      }
    }
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.base_price_kes <= 0) errs.base_price_kes = 'Price must be greater than 0';
    if (form.stock < 0) errs.stock = 'Stock cannot be negative';
    if (!form.category_id) errs.category_id = 'Category is required';
    if (!form.slug.trim()) errs.slug = 'Slug is required';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug))
      errs.slug = 'Slug must be lowercase letters, numbers, and hyphens only';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      base_price_kes: Math.round(form.base_price_kes * 100),
      stock: Math.round(form.stock),
      category_id: form.category_id,
      brand: form.brand.trim(),
      slug: form.slug.trim(),
      is_active: form.is_active,
      images: images.filter((img) => img.url && !img.uploading && !img.error),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (mode === 'create') {
        await submitCreate(payload);
      } else {
        await submitUpdate(product!.id, payload);
      }
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors ${
      errors[field] ? 'border-red-300' : 'border-gray-200'
    }`;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-900">
          ← Products
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-900">
          {mode === 'create' ? 'New product' : `Edit "${product?.name}"`}
        </h1>
      </div>

      {mode === 'edit' && product && (
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">Product ID</p>
          <p className="text-sm font-mono text-gray-700 select-all">{product.id}</p>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Organic Wildflower Honey"
            className={inputClass('name')}
          />
          <FieldError message={errors.name} />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none pointer-events-none">
              /products/
            </span>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setForm({ ...form, slug: e.target.value });
              }}
              placeholder="organic-wildflower-honey"
              className={`${inputClass('slug')} pl-24`}
            />
          </div>
          <FieldError message={errors.slug} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the product..."
            rows={4}
            maxLength={2000}
            className={`${inputClass('description')} resize-none`}
          />
          <p className="mt-1 text-xs text-gray-400 text-right">
            {form.description.length}/2000
          </p>
        </div>

        {/* Price + Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (KES) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                KES
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.base_price_kes || ''}
                onChange={(e) => setForm({ ...form, base_price_kes: Number(e.target.value) })}
                className={`${inputClass('base_price_kes')} pl-12`}
              />
            </div>
            <FieldError message={errors.base_price_kes} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock || ''}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className={inputClass('stock')}
            />
            <FieldError message={errors.stock} />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className={inputClass('category_id')}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.category_id} />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            placeholder="e.g. Acacia Farms"
            className={inputClass('brand')}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="honey, organic, raw"
            className={inputClass('tags')}
          />
          <p className="mt-1 text-xs text-gray-400">Separate with commas</p>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
              >
                {img.uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-gray-400">Uploading...</span>
                  </div>
                ) : img.error ? (
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <span className="text-xs text-red-500 text-center">Failed</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={img.url}
                      alt={img.alt ?? ''}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80 transition-colors"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
            {images.length < 4 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-400 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl leading-none mb-1">+</span>
                <span className="text-xs">Add image</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
          <p className="text-xs text-gray-400">Up to 4 images · JPEG, PNG or WebP · Max 5MB each</p>
        </div>

        {/* Published toggle */}
        <div className="flex items-center justify-between py-4 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Published</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {form.is_active
                ? 'Visible to customers in the shop'
                : 'Hidden from the shop (draft)'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, is_active: !form.is_active })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              form.is_active ? 'bg-gray-900' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.is_active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading
              ? mode === 'create'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'create'
              ? 'Create product'
              : 'Save changes'}
          </button>
          <Link
            href="/admin/products"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
