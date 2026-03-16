import ProductFormPage from '@/components/features/admin/product-form-page';
import { createServerClient } from '@/lib/db/server';

async function getCategories() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true });
  return data ?? [];
}

export default async function NewProductPage() {
  const categories = await getCategories();
  return <ProductFormPage mode="create" categories={categories} />;
}
