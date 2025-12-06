import ProductDetailClient from "./client";
import { productMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getProductById } from "@/services/products";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) return {};
  return productMetadata(product);
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
