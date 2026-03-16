import { createAdminProductService } from '@/services/admin/products';
import ProductsTable from '@/components/features/admin/products-table';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    status?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const search = params.search ?? '';
  const category = params.category ?? '';
  const status = params.status ?? '';
  const isActive = status === 'active' ? true : status === 'draft' ? false : undefined;

  const svc = createAdminProductService();
  const { products, totalPages, total } = await svc.getProducts({
    page,
    pageSize: 10,
    search: search || undefined,
    category: category || undefined,
    isActive,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} product{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          + Add product
        </Link>
      </div>

      <ProductsTable
        products={products}
        pagination={{ page, totalPages }}
        filters={{ search, category, status }}
      />
    </div>
  );
}
