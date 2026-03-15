import { notFound } from "next/navigation";
import ProductDetailClient from "./client";
import { getProductById } from "@/services/products";

interface PageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
