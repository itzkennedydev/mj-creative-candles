import { ProductCard } from "./product-card";
import { useProductsQuery } from "~/lib/hooks/use-products";

interface ProductGridProps {
  shopType?: "spirit-wear" | "regular-shop";
  searchQuery?: string;
}

export function ProductGrid({ shopType = "regular-shop", searchQuery = "" }: ProductGridProps) {
  const { data: products = [], isLoading, error } = useProductsQuery();
  
  // Filter products by shop type and search query
  const filteredProducts = products.filter(product => {
    const matchesShopType = shopType 
      ? (product.shopType === shopType || (!product.shopType && shopType === "regular-shop"))
      : true;
    
    const matchesSearch = searchQuery.trim() === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesShopType && matchesSearch;
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-fr">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg overflow-hidden animate-pulse h-full">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load products</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No products available</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-fr">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
