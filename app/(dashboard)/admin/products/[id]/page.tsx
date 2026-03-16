import { getAdminProductById } from '@/services/admin/products';
import ProductFormPage from '@/components/features/admin/product-form-page';
import { createServerClient } from '@/lib/db/server';
import { notFound } from 'next/navigation';

async function getCategories() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true });
  return data ?? [];
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id).catch(() => null),
    getCategories(),
  ]);

  if (!product) notFound();

  return <ProductFormPage mode="edit" product={product} categories={categories} />;
}
