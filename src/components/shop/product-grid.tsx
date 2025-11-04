import { ProductCard } from "./product-card";
import { useProductsQuery } from "~/lib/hooks/use-products";
import Image from "next/image";
import type { Product } from "~/lib/types";
import { useState } from "react";

interface ProductGridProps {
  shopType?: "spirit-wear" | "regular-shop";
  searchQuery?: string;
}

export function ProductGrid({ shopType = "regular-shop", searchQuery = "" }: ProductGridProps) {
  const { data: products = [], isLoading, error } = useProductsQuery();
  const [activeSchoolTab, setActiveSchoolTab] = useState<'moline' | 'united-township' | 'all'>('all');
  
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
  
  // For spirit-wear, group by school
  const groupProductsBySchool = (products: Product[]) => {
    const grouped: {
      moline: Product[];
      'united-township': Product[];
      other: Product[];
    } = {
      moline: [],
      'united-township': [],
      other: []
    };
    
    products.forEach(product => {
      if (product.school === 'moline') {
        grouped.moline.push(product);
      } else if (product.school === 'united-township') {
        grouped['united-township'].push(product);
      } else {
        grouped.other.push(product);
      }
    });
    
    return grouped;
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-fr">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg overflow-hidden animate-pulse h-full">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
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
  
  // For spirit-wear, show tabs for schools
  if (shopType === 'spirit-wear') {
    const grouped = groupProductsBySchool(filteredProducts);
    const hasMoline = grouped.moline.length > 0;
    const hasUnitedTownship = grouped['united-township'].length > 0;
    const hasBoth = hasMoline && hasUnitedTownship;
    
    // Determine which products to show based on active tab
    const getProductsToShow = () => {
      if (activeSchoolTab === 'moline') {
        return grouped.moline;
      } else if (activeSchoolTab === 'united-township') {
        return grouped['united-township'];
      } else {
        // Show all products
        return [...grouped.moline, ...grouped['united-township'], ...grouped.other];
      }
    };
    
    const productsToShow = getProductsToShow();
    
    return (
      <div className="space-y-6">
        {/* School Tabs */}
        {(hasMoline || hasUnitedTownship) && (
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-3 border-b border-black/[0.06] pb-3 sm:pb-4">
            {hasBoth && (
              <button
                onClick={() => setActiveSchoolTab('all')}
                className={`w-full sm:w-auto px-4 py-3.5 sm:px-4 md:px-6 sm:py-2.5 md:py-3 text-sm sm:text-sm md:text-base font-medium rounded-md transition-all duration-200 whitespace-nowrap justify-center touch-manipulation ${
                  activeSchoolTab === 'all'
                    ? 'bg-gray-600 text-white shadow-sm'
                    : 'bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]'
                }`}
              >
                All Schools
              </button>
            )}
            {hasMoline && (
              <button
                onClick={() => setActiveSchoolTab('moline')}
                className={`w-full sm:w-auto px-4 py-3.5 sm:px-4 md:px-6 sm:py-2.5 md:py-3 text-sm sm:text-sm md:text-base font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
                  activeSchoolTab === 'moline'
                    ? 'bg-gray-600 text-white shadow-sm'
                    : 'bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]'
                }`}
              >
                <div className="relative w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0">
                  <Image
                    src="/schools/moline-logo.png"
                    alt="Moline"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className="whitespace-nowrap">Moline High School</span>
              </button>
            )}
            {hasUnitedTownship && (
              <button
                onClick={() => setActiveSchoolTab('united-township')}
                className={`w-full sm:w-auto px-4 py-3.5 sm:px-4 md:px-6 sm:py-2.5 md:py-3 text-sm sm:text-sm md:text-base font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
                  activeSchoolTab === 'united-township'
                    ? 'bg-gray-600 text-white shadow-sm'
                    : 'bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]'
                }`}
              >
                <div className="relative w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0">
                  <Image
                    src="/schools/united-township-logo.png"
                    alt="United Township"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className="whitespace-nowrap">United Township High School</span>
              </button>
            )}
          </div>
        )}
        
        {/* Products Grid */}
        {productsToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-fr">
            {productsToShow.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-[13px] sm:text-[14px] text-gray-500 mb-4">No products available for this school</p>
          </div>
        )}
      </div>
    );
  }
  
  // For regular shop, show normal grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-fr">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
