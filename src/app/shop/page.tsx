"use client";

import { useState, useEffect } from "react";
import { Container } from "~/components/ui/container";
import { ProductGrid } from "~/components/shop/product-grid";
import { ShopSidebar } from "~/components/shop/shop-sidebar";
import { ProductsHeader } from "~/components/shop/products-header";
import { Search } from "lucide-react";
import { FloatingCart } from "~/components/shop/floating-cart";
import { usePrefetchProducts } from "~/lib/hooks/use-products";

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const prefetchProducts = usePrefetchProducts();

  // Prefetch products as soon as component mounts
  useEffect(() => {
    prefetchProducts();
  }, [prefetchProducts]);

  return (
    <div className="min-h-screen bg-white">
        {/* Shop Header - Full Width Background */}
        <div className="bg-gray-50">
          <Container>
            <div className="py-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop</h1>
                  <p className="text-gray-500 text-lg">Custom embroidery and apparel</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Main Content - Centered for better display with few products */}
        <Container>
          <div className="py-8 md:py-20">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                {/* Sidebar - Hidden on mobile, shown on desktop */}
                <div className="hidden lg:block w-72 flex-shrink-0">
                  <ShopSidebar />
                </div>
                
                {/* Mobile Sidebar Toggle - Temporarily Hidden */}
                {/* <div className="lg:hidden mb-4">
                  <button className="w-full bg-gray-100 rounded-lg p-4 text-left">
                    <span className="font-medium">Filters</span>
                    <span className="ml-2 text-sm text-gray-500">Tap to open</span>
                  </button>
                </div> */}
                
                <div className="flex-1 min-w-0">
                  <ProductsHeader />
                  <ProductGrid />
                </div>
              </div>
            </div>
          </div>
        </Container>
        
        {/* Floating Cart */}
        <FloatingCart />
      </div>
  );
}
