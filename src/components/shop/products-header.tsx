import { useProductsQuery } from "~/lib/hooks/use-products";

export function ProductsHeader() {
  const { data: products = [], isLoading } = useProductsQuery();
  
  const productCount = isLoading ? 0 : products.length;
  
  return (
    <div className="mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Products</h2>
      <p className="text-gray-600">
        {isLoading 
          ? "Loading products..." 
          : productCount === 1 
          ? "Showing 1 product"
          : `Showing ${productCount} products`
        }
      </p>
    </div>
  );
}

