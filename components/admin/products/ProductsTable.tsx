"use client";

import type { Product } from "@/types/product";
import ProductsRow from "./ProductsRow";
import Pagination from "./Pagination";

interface Props {
  products: Product[];
  currentPage: number;
  totalPages: number;
}

export default function ProductsTable({
  products,
  currentPage,
  totalPages,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <table
          className="min-w-full text-sm"
          role="table"
          aria-label="Admin products table"
        >
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductsRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination current={currentPage} total={totalPages} />
    </div>
  );
}
