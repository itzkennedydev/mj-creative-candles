import { ProductCard } from "./product-card";
import { useProductsQuery } from "~/lib/hooks/use-products";
import Image from "next/image";
import type { Product } from "~/lib/types";
import { useState, useMemo } from "react";

interface ProductGridProps {
  shopType?: "spirit-wear" | "regular-shop";
  searchQuery?: string;
  selectedCategory?: string;
  selectedSizes?: Set<string>;
  selectedPriceRanges?: Set<string>;
}

export function ProductGrid({ shopType = "regular-shop", searchQuery = "", selectedCategory = "All", selectedSizes = new Set(), selectedPriceRanges = new Set() }: ProductGridProps) {
  const { data: products = [], isLoading, error } = useProductsQuery();
  const [activeSchoolTab, setActiveSchoolTab] = useState<'moline' | 'united-township' | 'rock-island' | 'north' | 'elite-volleyball' | 'all'>('all');
  
  // Helper function to map category names to product categories
  const mapCategoryToProductCategory = (category: string): string | null => {
    const categoryMap: Record<string, string> = {
      'Tops': 'Apparel',
      'Bottoms': 'Apparel',
      'T-Shirts': 'Apparel', // Legacy support
      'Hoodies': 'Apparel', // Legacy support
      'Accessories': 'Accessories',
      'Limited Edition': 'Apparel',
      'Embroidery': 'Apparel',
      'Custom Apparel': 'Apparel',
      'Baby Items': 'Apparel',
    };
    return categoryMap[category] || null;
  };
  
  // Filter products by shop type, search query, category, and size - memoized for performance
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
    const matchesShopType = shopType 
      ? (product.shopType === shopType || (!product.shopType && shopType === "regular-shop"))
      : true;
    
    const matchesSearch = searchQuery.trim() === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category - be specific, no fallback
    const matchesCategory = selectedCategory === "All" || 
      // Tops: includes t-shirts, hoodies, crewnecks, sweatshirts, jackets, etc.
      (selectedCategory === 'Tops' && product.category === 'Apparel' && (product.name.toLowerCase().includes('shirt') || product.name.toLowerCase().includes('tee') || product.name.toLowerCase().includes('t-shirt') || product.name.toLowerCase().includes('hoodie') || product.name.toLowerCase().includes('crewneck') || product.name.toLowerCase().includes('sweatshirt') || product.name.toLowerCase().includes('jacket') || product.name.toLowerCase().includes('sweater')) && !product.name.toLowerCase().includes('beanie') && !product.name.toLowerCase().includes('hat') && !product.name.toLowerCase().includes('pant') && !product.name.toLowerCase().includes('short') && !product.name.toLowerCase().includes('bottom')) ||
      // Legacy support for T-Shirts
      (selectedCategory === 'T-Shirts' && product.category === 'Apparel' && (product.name.toLowerCase().includes('shirt') || product.name.toLowerCase().includes('tee') || product.name.toLowerCase().includes('t-shirt')) && !product.name.toLowerCase().includes('hoodie') && !product.name.toLowerCase().includes('crewneck') && !product.name.toLowerCase().includes('sweatshirt') && !product.name.toLowerCase().includes('beanie') && !product.name.toLowerCase().includes('hat')) ||
      // Bottoms: includes pants, shorts, leggings, etc.
      (selectedCategory === 'Bottoms' && product.category === 'Apparel' && (product.name.toLowerCase().includes('pant') || product.name.toLowerCase().includes('short') || product.name.toLowerCase().includes('legging') || product.name.toLowerCase().includes('bottom') || product.name.toLowerCase().includes('sweatpant'))) ||
      // Legacy support for Hoodies
      (selectedCategory === 'Hoodies' && product.category === 'Apparel' && (product.name.toLowerCase().includes('hoodie') || product.name.toLowerCase().includes('crewneck') || product.name.toLowerCase().includes('sweatshirt')) && !product.name.toLowerCase().includes('beanie') && !product.name.toLowerCase().includes('hat') && !product.name.toLowerCase().includes('t-shirt') && !product.name.toLowerCase().includes('tee')) ||
      (selectedCategory === 'Accessories' && (product.category === 'Accessories' || product.name.toLowerCase().includes('beanie') || product.name.toLowerCase().includes('hat') || product.name.toLowerCase().includes('bag') || product.name.toLowerCase().includes('accessory'))) ||
      (selectedCategory === 'Limited Edition' && product.category === 'Apparel' && (product.name.toLowerCase().includes('limited') || product.name.toLowerCase().includes('edition'))) ||
      (selectedCategory === 'Embroidery' && product.category === 'Apparel' && product.name.toLowerCase().includes('embroider')) ||
      (selectedCategory === 'Custom Apparel' && product.category === 'Apparel' && !product.name.toLowerCase().includes('spirit') && !product.name.toLowerCase().includes('limited') && !product.name.toLowerCase().includes('edition') && !product.name.toLowerCase().includes('hoodie') && !product.name.toLowerCase().includes('crewneck') && !product.name.toLowerCase().includes('sweatshirt') && !product.name.toLowerCase().includes('shirt') && !product.name.toLowerCase().includes('tee')) ||
      (selectedCategory === 'Baby Items' && product.category === 'Apparel' && (product.name.toLowerCase().includes('baby') || product.name.toLowerCase().includes('mama'))) ||
      (selectedCategory === 'Elite Volleyball' && product.category === 'Elite Volleyball');
    
    // Filter by size - if sizes are selected, product must have at least one of the selected sizes
    const matchesSize = selectedSizes.size === 0 || 
      (product.sizes && product.sizes.some(size => selectedSizes.has(size)));
    
    // Filter by price range - check base price and all possible sizes (with surcharges)
    const matchesPriceRange = selectedPriceRanges.size === 0 || (() => {
      const basePrice = product.price;
      const prices = new Set<number>();
      
      // Add base price for all sizes
      if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach(size => {
          const sizeSurcharge = size === 'XXL' ? 3 : size === '3XL' ? 5 : 0;
          prices.add(basePrice + sizeSurcharge);
        });
      } else {
        prices.add(basePrice);
      }
      
      // Check if any price matches any selected range
      return Array.from(prices).some(price => {
        return Array.from(selectedPriceRanges).some(range => {
          if (range === 'Under $25') return price < 25;
          if (range === '$25 - $50') return price >= 25 && price <= 50;
          if (range === '$50 - $100') return price > 50 && price <= 100;
          if (range === 'Over $100') return price > 100;
          return false;
        });
      });
    })();
    
      return matchesShopType && matchesSearch && matchesCategory && matchesSize && matchesPriceRange;
    });
  }, [products, shopType, searchQuery, selectedCategory, selectedSizes, selectedPriceRanges]);
  
  // For spirit-wear, group by school
  const groupProductsBySchool = (products: Product[]) => {
    const grouped: {
      moline: Product[];
      'united-township': Product[];
      'rock-island': Product[];
      north: Product[];
      'elite-volleyball': Product[];
      other: Product[];
    } = {
      moline: [],
      'united-township': [],
      'rock-island': [],
      north: [],
      'elite-volleyball': [],
      other: []
    };
    
    products.forEach(product => {
      if (product.category === 'Elite Volleyball') {
        grouped['elite-volleyball'].push(product);
      } else if (product.school === 'moline') {
        grouped.moline.push(product);
      } else if (product.school === 'united-township') {
        grouped['united-township'].push(product);
      } else if (product.school === 'rock-island') {
        grouped['rock-island'].push(product);
      } else if (product.school === 'north') {
        grouped.north.push(product);
      } else {
        grouped.other.push(product);
      }
    });
    
    return grouped;
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 md:gap-8 auto-rows-fr">
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
    const hasRockIsland = grouped['rock-island'].length > 0;
    const hasNorth = grouped.north.length > 0;
    const hasEliteVolleyball = grouped['elite-volleyball'].length > 0;
    const hasMultiple = [hasMoline, hasUnitedTownship, hasRockIsland, hasNorth, hasEliteVolleyball].filter(Boolean).length > 1;
    
    // Determine which products to show based on active tab
    const getProductsToShow = () => {
      if (activeSchoolTab === 'moline') {
        return grouped.moline;
      } else if (activeSchoolTab === 'united-township') {
        return grouped['united-township'];
      } else if (activeSchoolTab === 'rock-island') {
        return grouped['rock-island'];
      } else if (activeSchoolTab === 'north') {
        return grouped.north;
      } else if (activeSchoolTab === 'elite-volleyball') {
        return grouped['elite-volleyball'];
      } else {
        // Show all products
        return [...grouped.moline, ...grouped['united-township'], ...grouped['rock-island'], ...grouped.north, ...grouped['elite-volleyball'], ...grouped.other];
      }
    };
    
    const productsToShow = getProductsToShow();
    
    return (
      <div className="space-y-6">
        {/* School Tabs */}
        {(hasMoline || hasUnitedTownship || hasRockIsland || hasNorth || hasEliteVolleyball) && (
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-3 border-b border-black/[0.06] pb-3 sm:pb-4">
            {hasMultiple && (
              <button
                onClick={() => setActiveSchoolTab('all')}
                className={`w-full sm:w-auto px-4 py-3.5 sm:px-4 md:px-6 sm:py-2.5 md:py-3 text-sm sm:text-sm md:text-base font-medium rounded-md transition-all duration-200 whitespace-nowrap justify-center touch-manipulation ${
                  activeSchoolTab === 'all'
                    ? 'bg-[#0A5565] text-white'
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
                    ? 'bg-[#0A5565] text-white'
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
                    ? 'bg-[#0A5565] text-white'
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
            {hasRockIsland && (
              <button
                onClick={() => setActiveSchoolTab('rock-island')}
                className={`w-full sm:w-auto px-4 py-3.5 sm:px-4 md:px-6 sm:py-2.5 md:py-3 text-sm sm:text-sm md:text-base font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
                  activeSchoolTab === 'rock-island'
                    ? 'bg-[#0A5565] text-white'
                    : 'bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]'
                }`}
              >
                <div className="relative w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0">
                  <Image
                    src="/schools/rock-island-logo.png"
                    alt="Rock Island"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className="whitespace-nowrap">Rock Island High School</span>
              </button>
            )}
            {hasNorth && (
              <button
                onClick={() => setActiveSchoolTab('north')}
                className={`w-full sm:w-auto px-4 py-3.5 sm:px-4 md:px-6 sm:py-2.5 md:py-3 text-sm sm:text-sm md:text-base font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
                  activeSchoolTab === 'north'
                    ? 'bg-[#0A5565] text-white'
                    : 'bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]'
                }`}
              >
                <div className="relative w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0">
                  <Image
                    src="/schools/North.png"
                    alt="Wildcats"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className="whitespace-nowrap">Wildcats</span>
              </button>
            )}
            {hasEliteVolleyball && (
              <button
                onClick={() => setActiveSchoolTab('elite-volleyball')}
                className={`w-full sm:w-auto px-4 py-3.5 sm:px-4 md:px-6 sm:py-2.5 md:py-3 text-sm sm:text-sm md:text-base font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
                  activeSchoolTab === 'elite-volleyball'
                    ? 'bg-[#0A5565] text-white'
                    : 'bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]'
                }`}
              >
                <div className="relative w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0">
                  <Image
                    src="/schools/EliteLogo.png"
                    alt="Elite Volleyball"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className="whitespace-nowrap">Elite Volleyball</span>
              </button>
            )}
          </div>
        )}
        
        {/* Products Grid */}
        {productsToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 md:gap-8 auto-rows-fr">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 md:gap-8 auto-rows-fr">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
