import { categoriesMetadata } from "@/lib/seo";
import CategoriesClient from "./client";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export const metadata = categoriesMetadata();

function CategoriesFallback() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center my-8">
      <p className="font-medium text-red-700">Failed to load categories.</p>
      <p className="text-sm text-red-500 mt-1">Please refresh the page to try again.</p>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <ErrorBoundary fallback={<CategoriesFallback />}>
      <CategoriesClient />
    </ErrorBoundary>
  );
}
