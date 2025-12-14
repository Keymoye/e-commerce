// app/admin/products/[id]/page.tsx
import { getAdminProductById } from "@/services/admin/product";
import EditProductForm from "@/components/admin/ui/EditProductForm";

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const product = await getAdminProductById(params.id);

  if (!product) return <p>Product not found</p>;

  return <EditProductForm initialData={product} />;
}
