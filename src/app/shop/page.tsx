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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<Set<string>>(new Set());
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
                <h1 className="text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px] leading-[130%] font-bold text-gray-900">
                  Shop
                </h1>
                <span className="text-[14px] sm:text-[15px] md:text-[16px] leading-[140%] text-gray-500 mt-1">
                  Handcrafted embroidery • Local pickup available
                </span>
              </div>

              {/* Shop Selector Tabs - Clear labels with descriptions */}
              <div className="relative inline-flex p-[4px] bg-black/[0.03] rounded-xl border border-black/[0.06] w-full sm:w-auto">
                <button
                  onClick={() => setActiveShop("regular-shop")}
                  className={`relative flex-1 sm:flex-none px-[16px] sm:px-[20px] py-[10px] sm:py-[12px] rounded-lg transition-all duration-200 ${
                    activeShop === 'regular-shop' 
                      ? 'bg-[#0A5565] text-white' 
                      : 'text-black/[0.72] hover:text-black hover:bg-black/[0.03]'
                  }`}
                >
                  <span className="block text-[13px] sm:text-[14px] font-medium">Custom Orders</span>
                  <span className={`block text-[10px] sm:text-[11px] mt-0.5 ${activeShop === 'regular-shop' ? 'text-white/70' : 'text-black/[0.44]'}`}>
                    Beanies & Apparel
                  </span>
                </button>
                <button
                  onClick={() => setActiveShop("spirit-wear")}
                  className={`relative flex-1 sm:flex-none px-[16px] sm:px-[20px] py-[10px] sm:py-[12px] rounded-lg transition-all duration-200 ${
                    activeShop === 'spirit-wear' 
                      ? 'bg-[#0A5565] text-white' 
                      : 'text-black/[0.72] hover:text-black hover:bg-black/[0.03]'
                  }`}
                >
                  <span className="block text-[13px] sm:text-[14px] font-medium">Spirit Wear</span>
                  <span className={`block text-[10px] sm:text-[11px] mt-0.5 ${activeShop === 'spirit-wear' ? 'text-white/70' : 'text-black/[0.44]'}`}>
                    School & Team Gear
                  </span>
                </button>
              </div>
            </div>

            {/* Search Bar - Clean & functional */}
            <div className="mt-5 sm:mt-6 flex gap-3">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-gray-100 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A5565] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Filter Toggle - Mobile/Tablet */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden shrink-0 px-4 py-3 rounded-xl"
                variant="outline"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline ml-2 text-sm">Filters</span>
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
                <ShopSidebarNeo 
                  shopType={activeShop} 
                  onCategoryChange={setSelectedCategory}
                  onSizeChange={setSelectedSizes}
                  onPriceRangeChange={setSelectedPriceRanges}
                  selectedCategory={selectedCategory}
                  selectedSizes={selectedSizes}
                  selectedPriceRanges={selectedPriceRanges}
                />
              </div>
            </aside>

            {/* Mobile Filters Drawer */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 z-[200] bg-black/50" onClick={() => setShowFilters(false)}>
                <div 
                  className="absolute right-0 top-0 h-full w-[85%] sm:w-[80%] max-w-[320px] bg-white border-l border-gray-200"
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
                    <ShopSidebarNeo 
                      shopType={activeShop} 
                      onCategoryChange={setSelectedCategory}
                      onSizeChange={setSelectedSizes}
                      onPriceRangeChange={setSelectedPriceRanges}
                      selectedCategory={selectedCategory}
                      selectedSizes={selectedSizes}
                      selectedPriceRanges={selectedPriceRanges}
                    />
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
              <ProductGrid 
                shopType={activeShop} 
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                selectedSizes={selectedSizes}
                selectedPriceRanges={selectedPriceRanges}
              />
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
interface ShopSidebarNeoProps {
  shopType: string;
  selectedCategory: string;
  selectedSizes: Set<string>;
  selectedPriceRanges: Set<string>;
  onCategoryChange: (category: string) => void;
  onSizeChange: (sizes: Set<string>) => void;
  onPriceRangeChange: (ranges: Set<string>) => void;
}

function ShopSidebarNeo({ shopType, selectedCategory, selectedSizes, selectedPriceRanges, onCategoryChange, onSizeChange, onPriceRangeChange }: ShopSidebarNeoProps) {
  const categories = shopType === 'spirit-wear' 
    ? ['All', 'Tops', 'Bottoms', 'Accessories', 'Limited Edition']
    : ['All', 'Embroidery', 'Custom Apparel', 'Baby Items', 'Accessories'];

  // Toggle size selection
  const toggleSize = (size: string) => {
    const newSet = new Set(selectedSizes);
    if (newSet.has(size)) {
      newSet.delete(size);
    } else {
      newSet.add(size);
    }
    onSizeChange(newSet);
  };

  // Toggle price range selection
  const togglePriceRange = (range: string) => {
    const newSet = new Set(selectedPriceRanges);
    if (newSet.has(range)) {
      newSet.delete(range);
    } else {
      newSet.add(range);
    }
    onPriceRangeChange(newSet);
  };

  return (
    <div className="space-y-[24px] sm:space-y-[28px] lg:space-y-[32px]">
      {/* Categories */}
      <div>
        <h3 className="text-[13px] sm:text-[14px] leading-[130%] font-bold text-black/[0.72] mb-[12px] sm:mb-[16px]">Categories</h3>
        <div className="space-y-[6px] sm:space-y-[8px]">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => onCategoryChange(category)}
              variant={selectedCategory === category ? 'default' : 'ghost'}
              className={`w-full justify-start px-[14px] sm:px-[16px] py-[10px] sm:py-[12px] rounded-[12px] text-[13px] sm:text-[14px] leading-[130%] transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#0A5565] hover:bg-[#083d4a] text-white'
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
          {['Under $25', '$25 - $50', '$50 - $100', 'Over $100'].map((range) => {
            const isSelected = selectedPriceRanges.has(range);
            return (
              <label key={range} className="flex items-center gap-[10px] sm:gap-[12px] cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => togglePriceRange(range)}
                  className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] rounded-[4px] border-[2px] border-black/[0.12] checked:bg-[#74CADC] checked:border-[#74CADC] cursor-pointer"
                />
                <span className={`text-[13px] sm:text-[14px] leading-[130%] transition-colors ${
                  isSelected ? 'text-black font-medium' : 'text-black/[0.72] group-hover:text-black'
                }`}>
                  {range}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="text-[13px] sm:text-[14px] leading-[130%] font-bold text-black/[0.72] mb-[12px] sm:mb-[16px]">Size</h3>
        <div className="grid grid-cols-3 gap-[6px] sm:gap-[8px]">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
            const isSelected = selectedSizes.has(size);
            return (
            <Button
              key={size}
                onClick={() => toggleSize(size)}
              variant="outline"
                className={`px-[10px] sm:px-[12px] py-[6px] sm:py-[8px] rounded-[8px] text-[12px] sm:text-[14px] leading-[130%] transition-all duration-300 border-[2px] ${
                  isSelected
                    ? 'bg-[#0A5565] hover:bg-[#083d4a] text-white border-[#0A5565]'
                    : 'bg-black/[0.03] hover:bg-black/[0.06] text-black/[0.72] hover:border-black/[0.12] border-black/[0.12]'
                }`}
            >
              {size}
            </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
