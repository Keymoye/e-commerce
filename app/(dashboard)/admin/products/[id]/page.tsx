// app/admin/products/[id]/page.tsx
import { getAdminProductById } from "@/services/admin/products";
import EditProductForm from "@/components/features/admin/edit-product-form";
import { productSchema } from "@/services/admin/product-schemas";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getAdminProductById(id);

  if (!product) return <p>Product not found</p>;

  // Transform Product to match schema
  const initialData = productSchema.parse({
    id: product.id,
    name: product.name,
    base_price_kes: product.base_price_kes,
    stock: product.stock,
    category_id: product.category_id,
  });

  return <EditProductForm initialData={initialData} />;
}
