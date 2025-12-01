import { notFound } from "next/navigation";
import ProductDetailClient from "./client";
import { products } from "@/lib/products";
import { productMetadata } from "@/lib/seo";

interface Params {
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return {};
  return productMetadata(product);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return <ProductDetailClient productId={id} />;
}
