import type { Product } from "@/types/product";
import ProductsRow from "./ProductsRow";
import Pagination from "./Pagination";

interface Props {
  products: Product[];
  currentPage: number;
  totalPages: number;
  refresh?: () => void;
}

export default function ProductsTable({
  products,
  currentPage,
  totalPages,
  refresh,
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
              <th className="p-3 text-center">Category</th>
              <th className="p-3 text-center">Price</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductsRow
                key={product.id}
                product={product}
                onDeleted={refresh ?? (() => {})}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination current={currentPage} total={totalPages} />
    </div>
  );
}
