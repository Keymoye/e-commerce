import { notFound } from "next/navigation";
import ProductDetailClient from "./client";
import { products } from "@/lib/products";
import { productMetadata } from "@/lib/seo";

// Define the shape of the route params
type Params = {
  id: string;
};

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = params;
  const product = products.find((p) => p.id === id);
  if (!product) return {};
  return productMetadata(product);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return <ProductDetailClient productId={id} />;
}
