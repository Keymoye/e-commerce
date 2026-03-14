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
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
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
                    <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse mx-auto w-16"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse mx-auto w-12"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse mx-auto w-8"></div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse mx-auto w-16"></div>
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
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h3 className="font-medium text-red-600 mb-2">Error loading products</h3>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-sm text-gray-500">Get started by creating your first product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table
          className="min-w-full text-sm"
          role="table"
          aria-label="Admin products table"
        >
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-medium text-gray-900">Name</th>
              <th className="p-3 text-center font-medium text-gray-900">Category</th>
              <th className="p-3 text-center font-medium text-gray-900">Price</th>
              <th className="p-3 text-center font-medium text-gray-900">Stock</th>
              <th className="p-3 text-center font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.id}
                className={`border-t transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-gray-100`}
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
