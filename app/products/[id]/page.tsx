import ProductDetailClient from "./client";
import { products } from "@/lib/products";
import { productMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

const ProductDetailClientTyped = ProductDetailClient as any;

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) return {};
  return productMetadata(product);
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = products.find((p) => p.id === params.id);
  if (!product) notFound();
  return <ProductDetailClientTyped productId={params.id} />;
}
