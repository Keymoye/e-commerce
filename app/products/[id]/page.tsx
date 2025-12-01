import { notFound } from "next/navigation";
import ProductDetailClient from "./client";
import { products } from "@/lib/products";
import { productMetadata } from "@/lib/seo";

interface Params {
  id: string;
}

export async function generateMetadata({ params }: { params: Params }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) return {};
  return productMetadata(product);
}

export default function ProductDetailPage({ params }: { params: Params }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) notFound();
  return <ProductDetailClient productId={params.id} />;
}
