import { useProducts } from "~/lib/products-context";
import { ProductCard } from "./product-card";

export function ProductGrid() {
  const { products } = useProducts();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
