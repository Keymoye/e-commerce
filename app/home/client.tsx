import ProductsHub from "@/components/products/ProductsHub";

export default function HomePage() {
  return (
    <main className="p-4">
      <h2 className="sr-only">Home — Featured products</h2>
      <ProductsHub mode="featured" limit={8} />
    </main>
  );
}
