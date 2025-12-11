import { ProductCard } from "./product-card";
import { useProductsQuery } from "~/lib/hooks/use-products";
import type { Product } from "~/lib/types";
import { getProductPrice } from "~/lib/types";
import { useMemo } from "react";

interface ProductGridProps {
  searchQuery?: string;
  selectedCategory?: string;
  selectedPriceRanges?: Set<string>;
}

export function ProductGrid({
  searchQuery = "",
  selectedCategory = "All",
  selectedPriceRanges = new Set(),
}: ProductGridProps) {
  const { data: products = [], isLoading, error } = useProductsQuery();

  // Helper function to map category names to product tags
  const mapCategoryToTags = (category: string): string[] => {
    const categoryMap: Record<string, string[]> = {
      "Wax Melts": ["wax melt", "wax melts"],
      "Jar Candles": ["jar candle", "candle"],
      "Wax Melt Boxes": ["wax melt box", "box"],
      "Dessert Candles": ["dessert candle", "dessert"],
    };
    return categoryMap[category] || [];
  };

  // Filter products by search query, category, and price - memoized for performance
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Only show visible products (not Spirit Wear)
      if (
        product.visibility !== "visible" ||
        product.category === "Spirit Wear"
      ) {
        return false;
      }

      const matchesSearch =
        searchQuery.trim() === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by category using tags
      const matchesCategory =
        selectedCategory === "All" ||
        (product.tags &&
          product.tags.some((tag) =>
            mapCategoryToTags(selectedCategory).some((catTag) =>
              tag.toLowerCase().includes(catTag.toLowerCase()),
            ),
          ));

      // Candles don't have sizes, so skip size filter
      const matchesSize = true;

      // Filter by price range
      const matchesPriceRange =
        selectedPriceRanges.size === 0 ||
        (() => {
          const basePrice = getProductPrice(product);

          // Check if price matches any selected range
          return Array.from(selectedPriceRanges).some((range) => {
            if (range === "Under $25") return basePrice < 25;
            if (range === "$25 - $50")
              return basePrice >= 25 && basePrice <= 50;
            if (range === "$50 - $100")
              return basePrice > 50 && basePrice <= 100;
            if (range === "Over $100") return basePrice > 100;
            return false;
          });
        })();

      return matchesSearch && matchesCategory && matchesPriceRange;
    });
  }, [products, searchQuery, selectedCategory, selectedPriceRanges]);

  if (isLoading) {
    return (
      <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="h-full animate-pulse overflow-hidden rounded-lg bg-white"
          >
            <div className="aspect-square bg-gray-200"></div>
            <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="h-8 w-1/4 rounded bg-gray-200"></div>
              <div className="h-10 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-red-600">Failed to load products</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-500">
          No candles found matching your criteria.
        </p>
      </div>
    );
  }

  // Simple grid for candle products
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
