import ProductDetailClient from "./client";
import { productMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { productService } from '@/services/product.service';
import { AppError } from '@/errors/AppError';

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const product = await productService.getProductById(params.id);
    if (!product) return {};
    return productMetadata(product);
  } catch (error) {
    if (AppError.isAppError(error) && error.statusCode === 404) return {};
    throw error;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const product = await productService.getProductById(params.id);
    return <ProductDetailClient product={product} />;
  } catch (error) {
    if (AppError.isAppError(error) && error.statusCode === 404) notFound();
    throw error;
  }
}
