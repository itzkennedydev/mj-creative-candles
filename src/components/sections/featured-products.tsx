"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { useCart } from "~/lib/cart-context";
import { useProductsQuery } from "~/lib/hooks/use-products";
import { ProductCard } from "~/components/shop/product-card";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import type { Product } from "~/lib/types";

function FeaturedProductsComponent() {
  const { addItem } = useCart();
  const { data: allProducts, isLoading } = useProductsQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Memoize filtered products to prevent recalculation on every render
  const products = useMemo(() =>
    allProducts
      ?.filter((p) => p.visibility === "visible" && p.featured)
      .slice(0, 20) || [],
    [allProducts]
  );

  // Memoize the addItem callback to prevent ProductCard re-renders
  const handleAddToCart = useCallback((product: Product) => {
    addItem(product, 1);
  }, [addItem]);

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  if (isLoading) {
    return (
      <section className="mb-[90px] bg-white py-12 sm:py-16">
        <Container>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              <span className="sm:hidden">Featured Product</span>
              <span className="hidden sm:inline">Featured Products</span>
            </h2>
            <p className="mt-2 text-gray-600">
              Hand-picked favorites from our collection
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-sm bg-gray-100"
              />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  const handleNext = useCallback(() => {
    if (currentIndex + itemsPerView < products.length) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, itemsPerView, products.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Memoize visible products slice
  const visibleProducts = useMemo(() =>
    products.slice(currentIndex, currentIndex + itemsPerView),
    [products, currentIndex, itemsPerView]
  );

  return (
    <section className="mb-[90px] bg-white py-12 sm:py-16">
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              <span className="sm:hidden">Featured Product</span>
              <span className="hidden sm:inline">Featured Products</span>
            </h2>
            <p className="mt-2 text-gray-600">
              Hand-picked favorites from our collection
            </p>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/shop">
              <Button variant="secondary" className="px-6">
                View All Products
              </Button>
            </Link>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="rounded-full border border-gray-300 p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous products"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex + itemsPerView >= products.length}
                className="rounded-full border border-gray-300 p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next products"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showAddToCart={true}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {/* Mobile only: centered button below products */}
        <div className="mt-6 text-center sm:hidden">
          <Link href="/shop">
            <Button variant="secondary" className="w-full px-8 py-3">
              View All Products
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const FeaturedProducts = memo(FeaturedProductsComponent);
