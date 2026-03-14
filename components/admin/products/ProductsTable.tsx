"use client";

import type { Product } from "@/types/product";
import ProductsRow from "./ProductsRow";
import Pagination from "./Pagination";

interface Props {
  products: Product[];
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  error?: string | null;
}

export default function ProductsTable({
  products,
  currentPage,
  totalPages,
  loading = false,
  error = null,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-center">Category</th>
                <th className="p-3 text-center">Price</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-muted rounded animate-pulse mx-auto w-16"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-muted rounded animate-pulse mx-auto w-12"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-muted rounded animate-pulse mx-auto w-8"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-muted rounded animate-pulse mx-auto w-16"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
        <h3 className="font-medium text-destructive mb-2">Error loading products</h3>
        <p className="text-sm text-destructive/80">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
        <p className="text-sm text-muted-foreground">Get started by creating your first product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table
          className="min-w-full text-sm"
          role="table"
          aria-label="Admin products table"
        >
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left font-medium text-foreground">Name</th>
              <th className="p-3 text-center font-medium text-foreground">Category</th>
              <th className="p-3 text-center font-medium text-foreground">Price</th>
              <th className="p-3 text-center font-medium text-foreground">Stock</th>
              <th className="p-3 text-center font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.id}
                className={`border-t transition-colors ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                } hover:bg-muted/50`}
              >
                <ProductsRow product={product} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination current={currentPage} total={totalPages} />
    </div>
  );
}
