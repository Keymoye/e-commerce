import { getAdminProducts } from "@/services/admin/product";
import ProductsTable from "@/components/admin/products/ProductsTable";

interface Props {
  searchParams: { page?: string };
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const page = Number(searchParams.page ?? 1);
  const pageSize = 10;

  const { products, totalPages } = await getAdminProducts(page, pageSize);

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Products</h2>

      <ProductsTable
        products={products}
        currentPage={page}
        totalPages={totalPages}
        refresh={() => location.reload()} // simple page reload to refresh table
      />
    </section>
  );
}
