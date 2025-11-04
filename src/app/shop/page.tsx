"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { usePrefetchProducts } from "~/lib/hooks/use-products";
import { ProductGrid } from "~/components/shop/product-grid";
import { FloatingCart } from "~/components/shop/floating-cart";
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeShop, setActiveShop] = useState<"spirit-wear" | "regular-shop">("regular-shop");
  const [showFilters, setShowFilters] = useState(false);
  const prefetchProducts = usePrefetchProducts();

  // Prefetch products as soon as component mounts
  useEffect(() => {
    prefetchProducts();
  }, [prefetchProducts]);

  return (
    <main className="min-h-screen bg-white pb-[80px] lg:pb-0">
      {/* Overlay background for transitions */}
      <div 
        className="pointer-events-none fixed h-full w-full z-[100] top-0" 
        style={{ backgroundColor: "rgb(247, 247, 247)", opacity: 0 }}
      />

      {/* Shop Header - NEO Style */}
      <section className="bg-[#F7F7F7]/50 backdrop-blur-sm border-b border-black/[0.06]">
        <Container>
          <div className="py-[24px] sm:py-[28px] md:py-[32px] lg:py-[40px]">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-[16px] sm:gap-[20px] lg:gap-[24px]">
              <div className="flex flex-col">
                <h1 className="text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px] leading-[130%] font-bold text-black/[0.72]">
                  Shop
                </h1>
                <span className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[20px] leading-[130%] text-black/[0.44] mt-[4px]">
                  Custom embroidery and apparel
                </span>
              </div>

              {/* Shop Selector Tabs - NEO Style */}
              <div className="relative inline-flex p-[4px] bg-black/[0.03] rounded-md border border-black/[0.06] w-full sm:w-auto">
                <button
                  onClick={() => setActiveShop("regular-shop")}
                  className={`relative flex-1 sm:flex-none px-[18px] sm:px-[22px] py-[10px] sm:py-[11px] text-[13px] sm:text-[14px] leading-[130%] rounded-md transition-all duration-[0.25s] whitespace-nowrap ${
                    activeShop === 'regular-shop' 
                      ? 'bg-[#74CADC] text-[#0A5565] font-medium shadow-sm' 
                      : 'text-black/[0.72] hover:text-black'
                  }`}
                >
                  Stitch Please
                </button>
                <button
                  onClick={() => setActiveShop("spirit-wear")}
                  className={`relative flex-1 sm:flex-none px-[18px] sm:px-[22px] py-[10px] sm:py-[11px] text-[13px] sm:text-[14px] leading-[130%] rounded-md transition-all duration-[0.25s] whitespace-nowrap ${
                    activeShop === 'spirit-wear' 
                      ? 'bg-gray-600 text-white font-medium shadow-sm' 
                      : 'text-black/[0.72] hover:text-black'
                  }`}
                >
                  Spirit Wear
                </button>
              </div>
            </div>

            {/* Search Bar - NEO Style */}
            <div className="mt-[20px] sm:mt-[24px] flex gap-[12px] sm:gap-[16px]">
              <div className="flex-1 relative">
                <Search className="absolute left-[12px] sm:left-[16px] top-1/2 transform -translate-y-1/2 h-[16px] w-[16px] sm:h-[18px] sm:w-[18px] text-black/[0.44]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-[40px] sm:pl-[48px] pr-[16px] sm:pr-[24px] py-[12px] sm:py-[14px] bg-black/[0.03] rounded-md text-[13px] sm:text-[14px] leading-[130%] placeholder:text-black/[0.44] focus:outline-none focus:bg-black/[0.06] transition-all duration-[0.25s]"
                />
              </div>
              
              {/* Filter Toggle - Mobile/Tablet */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden shrink-0 px-[14px] sm:px-[16px] py-[12px] sm:py-[14px]"
                variant="outline"
              >
                <Filter className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                <span className="hidden xs:inline ml-2 text-[13px] sm:text-[14px]">Filters</span>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <Container>
        <div className="py-[24px] sm:py-[32px] md:py-[40px]">
          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-[32px] xl:gap-[40px]">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-[100px]">
                <ShopSidebarNeo shopType={activeShop} />
              </div>
            </aside>

            {/* Mobile Filters Drawer */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 z-[200] bg-black/50" onClick={() => setShowFilters(false)}>
                <div 
                  className="absolute right-0 top-0 h-full w-[85%] sm:w-[80%] max-w-[320px] bg-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-[20px] sm:p-[24px] border-b border-black/[0.06]">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[16px] sm:text-[18px] leading-[130%] font-bold text-black/[0.72]">Filters</h2>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-[8px] hover:bg-black/[0.03] rounded-full transition-colors active:scale-95"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 25" fill="none">
                          <path d="M11.9969 13.7289L7.09688 18.6289C6.91354 18.8122 6.68021 18.9039 6.39688 18.9039C6.11354 18.9039 5.88021 18.8122 5.69688 18.6289C5.51354 18.4456 5.42188 18.2122 5.42188 17.9289C5.42188 17.6456 5.51354 17.4122 5.69688 17.2289L10.5969 12.3289L5.69688 7.42891C5.51354 7.24557 5.42188 7.01224 5.42188 6.72891C5.42188 6.44557 5.51354 6.21224 5.69688 6.02891C5.88021 5.84557 6.11354 5.75391 6.39688 5.75391C6.68021 5.75391 6.91354 5.84557 7.09688 6.02891L11.9969 10.9289L16.8969 6.02891C17.0802 5.84557 17.3135 5.75391 17.5969 5.75391C17.8802 5.75391 18.1135 5.84557 18.2969 6.02891C18.4802 6.21224 18.5719 6.44557 18.5719 6.72891C18.5719 7.01224 18.4802 7.24557 18.2969 7.42891L13.3969 12.3289L18.2969 17.2289C18.4802 17.4122 18.5719 17.6456 18.5719 17.9289C18.5719 18.2122 18.4802 18.4456 18.2969 18.6289C18.1135 18.8122 17.8802 18.9039 17.5969 18.9039C17.3135 18.9039 17.0802 18.8122 16.8969 18.6289L11.9969 13.7289Z" fill="black" fillOpacity="0.72" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-[20px] sm:p-[24px] overflow-y-auto h-[calc(100%-72px)] sm:h-[calc(100%-80px)]">
                    <ShopSidebarNeo shopType={activeShop} />
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-[20px] sm:mb-[24px]">
                <p className="text-[13px] sm:text-[14px] leading-[130%] text-black/[0.44]">
                  Showing all products in {activeShop === 'spirit-wear' ? 'Spirit Wear' : 'Stitch Please Shop'}
                </p>
              </div>
              
              {/* Product Grid Component */}
              <ProductGrid shopType={activeShop} searchQuery={searchQuery} />
            </div>
          </div>
        </div>
      </Container>

      {/* Floating Cart */}
      <FloatingCart />
    </main>
  );
}

// NEO-styled Sidebar Component
function ShopSidebarNeo({ shopType }: { shopType: string }) {
  const categories = shopType === 'spirit-wear' 
    ? ['All', 'T-Shirts', 'Hoodies', 'Accessories', 'Limited Edition']
    : ['All', 'Embroidery', 'Custom Apparel', 'Baby Items', 'Accessories'];

  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <div className="space-y-[24px] sm:space-y-[28px] lg:space-y-[32px]">
      {/* Categories */}
      <div>
        <h3 className="text-[13px] sm:text-[14px] leading-[130%] font-bold text-black/[0.72] mb-[12px] sm:mb-[16px]">Categories</h3>
        <div className="space-y-[6px] sm:space-y-[8px]">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'ghost'}
              className={`w-full justify-start px-[14px] sm:px-[16px] py-[10px] sm:py-[12px] rounded-[12px] text-[13px] sm:text-[14px] leading-[130%] transition-all duration-[0.25s] ${
                selectedCategory === category
                  ? 'bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565]'
                  : 'bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-[13px] sm:text-[14px] leading-[130%] font-bold text-black/[0.72] mb-[12px] sm:mb-[16px]">Price Range</h3>
        <div className="space-y-[6px] sm:space-y-[8px]">
          {['Under $25', '$25 - $50', '$50 - $100', 'Over $100'].map((range) => (
            <label key={range} className="flex items-center gap-[10px] sm:gap-[12px] cursor-pointer group">
              <input
                type="checkbox"
                className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] rounded-[4px] border-[2px] border-black/[0.12] checked:bg-[#74CADC] checked:border-[#74CADC]"
              />
              <span className="text-[13px] sm:text-[14px] leading-[130%] text-black/[0.72] group-hover:text-black transition-colors">
                {range}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="text-[13px] sm:text-[14px] leading-[130%] font-bold text-black/[0.72] mb-[12px] sm:mb-[16px]">Size</h3>
        <div className="grid grid-cols-3 gap-[6px] sm:gap-[8px]">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
            <Button
              key={size}
              variant="outline"
              className="px-[10px] sm:px-[12px] py-[6px] sm:py-[8px] bg-black/[0.03] hover:bg-black/[0.06] text-black/[0.72] rounded-[8px] text-[12px] sm:text-[14px] leading-[130%] transition-all duration-[0.25s] hover:border-black/[0.12] border-[2px]"
            >
              {size}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
