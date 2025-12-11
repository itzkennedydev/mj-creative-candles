"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, Clock, Sparkles } from "lucide-react";
import { usePrefetchProducts } from "~/lib/hooks/use-products";
import { ProductGrid } from "~/components/shop/product-grid";
import { FloatingCart } from "~/components/shop/floating-cart";
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";

// Discount code expiration: Dec 1st 11:59 PM CST = Dec 2nd 05:59:59 UTC
const PROMO_EXPIRES = new Date("2025-12-02T05:59:59Z");

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<Set<string>>(
    new Set(),
  );
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const prefetchProducts = usePrefetchProducts();

  // Check if promo is still active
  const isPromoActive = new Date() < PROMO_EXPIRES;

  // Prefetch products as soon as component mounts
  useEffect(() => {
    prefetchProducts();
  }, [prefetchProducts]);

  // Countdown timer
  useEffect(() => {
    if (!isPromoActive) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = PROMO_EXPIRES.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isPromoActive]);

  return (
    <main className="min-h-screen bg-white pb-[80px] lg:pb-0">
      {/* Overlay background for transitions */}
      <div
        className="pointer-events-none fixed top-0 z-[100] h-full w-full"
        style={{ backgroundColor: "rgb(247, 247, 247)", opacity: 0 }}
      />

      {/* Promo Banner - Urgency-driven */}
      {isPromoActive && showPromoBanner && (
        <div className="relative bg-[#1d1d1f] text-white">
          <Container>
            <div className="flex items-center justify-center gap-3 py-3 text-center sm:gap-4">
              <Sparkles className="h-4 w-4 flex-shrink-0 animate-pulse sm:h-5 sm:w-5" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-sm font-semibold sm:text-base">
                  15% OFF Everything
                </span>
                <span className="hidden text-white/60 sm:inline">•</span>
                <span className="text-xs text-white/90 sm:text-sm">
                  Use code{" "}
                  <span className="mx-1 rounded bg-white/20 px-2 py-0.5 font-bold">
                    STITCHIT
                  </span>{" "}
                  at checkout
                </span>
              </div>
              {timeLeft && (
                <div className="ml-2 hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 md:flex">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs font-bold">
                    {timeLeft}
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowPromoBanner(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-white/10"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Container>
          {/* Mobile countdown */}
          {timeLeft && (
            <div className="bg-white/10 py-1.5 text-center md:hidden">
              <div className="flex items-center justify-center gap-1.5 text-xs">
                <Clock className="h-3 w-3" />
                <span>
                  Ends in{" "}
                  <span className="font-mono font-bold">{timeLeft}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shop Header - NEO Style */}
      <section className="border-b border-black/[0.06] bg-[#F7F7F7]/50 backdrop-blur-sm">
        <Container>
          <div className="py-[24px] sm:py-[28px] md:py-[32px] lg:py-[40px]">
            <div className="flex flex-col gap-[16px] sm:flex-row sm:items-end sm:justify-between sm:gap-[20px] lg:gap-[24px]">
              <div className="flex flex-col">
                <h1 className="text-[28px] font-bold leading-[130%] text-gray-900 sm:text-[32px] md:text-[36px] lg:text-[40px]">
                  Shop
                </h1>
                <span className="mt-1 text-[14px] leading-[140%] text-gray-500 sm:text-[15px] md:text-[16px]">
                  Handcrafted candles & wax melts • Made with love
                </span>
              </div>
            </div>

            {/* Search Bar - Clean & functional */}
            <div className="mt-5 flex gap-3 sm:mt-6">
              <div className="group relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-600" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-gray-100 py-3 pl-11 pr-10 text-sm transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter Toggle - Mobile/Tablet */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0 rounded-xl px-4 py-3 lg:hidden"
                variant="outline"
              >
                <Filter className="h-4 w-4" />
                <span className="ml-2 hidden text-sm sm:inline">Filters</span>
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
                  onCategoryChange={setSelectedCategory}
                  onPriceRangeChange={setSelectedPriceRanges}
                  selectedCategory={selectedCategory}
                  selectedPriceRanges={selectedPriceRanges}
                />
              </div>
            </aside>

            {/* Mobile Filters Drawer */}
            {showFilters && (
              <div
                className="fixed inset-0 z-[200] bg-black/50 lg:hidden"
                onClick={() => setShowFilters(false)}
              >
                <div
                  className="absolute right-0 top-0 h-full w-[85%] max-w-[320px] border-l border-gray-200 bg-white sm:w-[80%]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="border-b border-black/[0.06] p-[20px] sm:p-[24px]">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[16px] font-bold leading-[130%] text-black/[0.72] sm:text-[18px]">
                        Filters
                      </h2>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="rounded-full p-[8px] transition-colors hover:bg-black/[0.03] active:scale-95"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 25"
                          fill="none"
                        >
                          <path
                            d="M11.9969 13.7289L7.09688 18.6289C6.91354 18.8122 6.68021 18.9039 6.39688 18.9039C6.11354 18.9039 5.88021 18.8122 5.69688 18.6289C5.51354 18.4456 5.42188 18.2122 5.42188 17.9289C5.42188 17.6456 5.51354 17.4122 5.69688 17.2289L10.5969 12.3289L5.69688 7.42891C5.51354 7.24557 5.42188 7.01224 5.42188 6.72891C5.42188 6.44557 5.51354 6.21224 5.69688 6.02891C5.88021 5.84557 6.11354 5.75391 6.39688 5.75391C6.68021 5.75391 6.91354 5.84557 7.09688 6.02891L11.9969 10.9289L16.8969 6.02891C17.0802 5.84557 17.3135 5.75391 17.5969 5.75391C17.8802 5.75391 18.1135 5.84557 18.2969 6.02891C18.4802 6.21224 18.5719 6.44557 18.5719 6.72891C18.5719 7.01224 18.4802 7.24557 18.2969 7.42891L13.3969 12.3289L18.2969 17.2289C18.4802 17.4122 18.5719 17.6456 18.5719 17.9289C18.5719 18.2122 18.4802 18.4456 18.2969 18.6289C18.1135 18.8122 17.8802 18.9039 17.5969 18.9039C17.3135 18.9039 17.0802 18.8122 16.8969 18.6289L11.9969 13.7289Z"
                            fill="black"
                            fillOpacity="0.72"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="h-[calc(100%-72px)] overflow-y-auto p-[20px] sm:h-[calc(100%-80px)] sm:p-[24px]">
                    <ShopSidebarNeo
                      onCategoryChange={setSelectedCategory}
                      onPriceRangeChange={setSelectedPriceRanges}
                      selectedCategory={selectedCategory}
                      selectedPriceRanges={selectedPriceRanges}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-[20px] sm:mb-[24px]">
                <p className="text-[13px] leading-[130%] text-black/[0.44] sm:text-[14px]">
                  Showing all candles & wax melts
                </p>
              </div>

              {/* Product Grid Component */}
              <ProductGrid
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
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
  selectedCategory: string;
  selectedPriceRanges: Set<string>;
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (ranges: Set<string>) => void;
}

function ShopSidebarNeo({
  selectedCategory,
  selectedPriceRanges,
  onCategoryChange,
  onPriceRangeChange,
}: ShopSidebarNeoProps) {
  const categories = [
    "All",
    "Wax Melts",
    "Jar Candles",
    "Wax Melt Boxes",
    "Dessert Candles",
  ];

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
        <h3 className="mb-[12px] text-[13px] font-bold leading-[130%] text-black/[0.72] sm:mb-[16px] sm:text-[14px]">
          Categories
        </h3>
        <div className="space-y-[6px] sm:space-y-[8px]">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => onCategoryChange(category)}
              variant={selectedCategory === category ? "default" : "ghost"}
              className={`w-full justify-start rounded-[12px] px-[14px] py-[10px] text-[13px] leading-[130%] transition-all duration-300 sm:px-[16px] sm:py-[12px] sm:text-[14px] ${
                selectedCategory === category
                  ? "bg-[#1d1d1f] text-white hover:bg-[#0a0a0a]"
                  : "bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-[12px] text-[13px] font-bold leading-[130%] text-black/[0.72] sm:mb-[16px] sm:text-[14px]">
          Price Range
        </h3>
        <div className="space-y-[6px] sm:space-y-[8px]">
          {["Under $25", "$25 - $50", "$50 - $100", "Over $100"].map(
            (range) => {
              const isSelected = selectedPriceRanges.has(range);
              return (
                <label
                  key={range}
                  className="group flex cursor-pointer items-center gap-[10px] sm:gap-[12px]"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePriceRange(range)}
                    className="h-[16px] w-[16px] cursor-pointer rounded-[4px] border-[2px] border-black/[0.12] checked:border-[#737373] checked:bg-[#737373] sm:h-[18px] sm:w-[18px]"
                  />
                  <span
                    className={`text-[13px] leading-[130%] transition-colors sm:text-[14px] ${
                      isSelected
                        ? "font-medium text-black"
                        : "text-black/[0.72] group-hover:text-black"
                    }`}
                  >
                    {range}
                  </span>
                </label>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
