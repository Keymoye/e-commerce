import { categoriesMetadata } from "@/lib/seo";
import CategoriesClient from "./client";

export const metadata = categoriesMetadata();

export default function CategoriesPage() {
  return <CategoriesClient />;
}
