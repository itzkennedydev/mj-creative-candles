import { useProductsQuery } from "~/lib/hooks/use-products";

interface ProductsHeaderProps {
  shopType?: "spirit-wear" | "regular-shop";
}

export function ProductsHeader({ shopType = "regular-shop" }: ProductsHeaderProps) {
  const { data: products = [], isLoading } = useProductsQuery();
  
  const filteredProducts = shopType 
    ? products.filter(p => p.shopType === shopType || (!p.shopType && shopType === "regular-shop"))
    : products;
  
  const productCount = isLoading ? 0 : filteredProducts.length;
  
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

