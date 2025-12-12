import { ProductCard } from "./product-card";
import { useProductsQuery } from "~/lib/hooks/use-products";
import type { Product } from "~/lib/types";
import { getProductPrice } from "~/lib/types";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";

interface ProductGridProps {
  searchQuery?: string;
  selectedCategory?: string;
  selectedPriceRanges?: Set<string>;
  selectedScent?: string | null;
  showFeatured?: boolean;
  showSale?: boolean;
  sortBy?: string | null;
}

const PRODUCTS_PER_PAGE = 12;

export function ProductGrid({
  searchQuery = "",
  selectedCategory = "All",
  selectedPriceRanges = new Set(),
  selectedScent = null,
  showFeatured = false,
  showSale = false,
  sortBy = null,
}: ProductGridProps) {
  const { data: products = [], isLoading, error } = useProductsQuery();
  const [currentPage, setCurrentPage] = useState(1);

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

  // Helper function to check if product matches scent type
  const matchesScentType = (product: Product, scent: string): boolean => {
    const scentMap: Record<string, string[]> = {
      citrus: ["citrus", "lemon", "orange", "lime", "grapefruit"],
      bakery: [
        "bakery",
        "vanilla",
        "cookie",
        "cake",
        "frosting",
        "baked",
        "buttercream",
      ],
      berry: [
        "berry",
        "strawberry",
        "blueberry",
        "raspberry",
        "blackberry",
        "cranberry",
      ],
      fresh: [
        "fresh",
        "clean",
        "linen",
        "cotton",
        "ocean",
        "mint",
        "eucalyptus",
      ],
      sweet: ["sweet", "candy", "sugar", "caramel", "honey", "maple"],
      warm: [
        "warm",
        "cinnamon",
        "spice",
        "amber",
        "sandalwood",
        "cedar",
        "clove",
        "nutmeg",
      ],
    };

    const scentKeywords = scentMap[scent.toLowerCase()] || [];

    // Search in product name, description, tags, and scent notes
    const productText =
      `${product.name} ${product.description} ${product.tags?.join(" ") || ""} ${product.topNotes || ""} ${product.middleNotes || ""} ${product.baseNotes || ""} ${product.scentFamily || ""}`.toLowerCase();

    return scentKeywords.some((keyword) => productText.includes(keyword));
  };

  // Filter products by search query, category, and price - memoized for performance
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
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
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.topNotes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.middleNotes
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        product.baseNotes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.scentFamily?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by category using tags
      const matchesCategory =
        selectedCategory === "All" ||
        (product.tags &&
          product.tags.some((tag) =>
            mapCategoryToTags(selectedCategory).some((catTag) =>
              tag.toLowerCase().includes(catTag.toLowerCase()),
            ),
          ));

      // Filter by scent type
      const matchesScent =
        !selectedScent || matchesScentType(product, selectedScent);

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

      // Filter by featured
      const matchesFeatured = !showFeatured || product.featured === true;

      // Filter by sale (check if product has sale price)
      const matchesSale =
        !showSale || (product.salePrice !== undefined && product.salePrice > 0);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesScent &&
        matchesPriceRange &&
        matchesFeatured &&
        matchesSale
      );
    });

    // Apply sorting
    if (sortBy === "newest") {
      // Sort by product ID (newer products have higher IDs in most cases)
      // Or you could add a createdAt field to products in the future
      filtered = [...filtered].reverse();
    } else if (sortBy === "price-low") {
      filtered = [...filtered].sort(
        (a, b) => getProductPrice(a) - getProductPrice(b),
      );
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort(
        (a, b) => getProductPrice(b) - getProductPrice(a),
      );
    }

    return filtered;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedPriceRanges,
    selectedScent,
    showFeatured,
    showSale,
    sortBy,
  ]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedPriceRanges,
    selectedScent,
    showFeatured,
    showSale,
    sortBy,
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Scroll to top when page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  // Simple grid for candle products with pagination
  return (
    <div>
      {/* Products Grid */}
      <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            className="rounded-xl px-4 py-2 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1 hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1;

              const showEllipsis =
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2);

              if (showEllipsis) {
                return (
                  <span key={page} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }

              if (!showPage) return null;

              return (
                <Button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  className={`h-10 w-10 rounded-xl p-0 ${
                    currentPage === page
                      ? "bg-[#1d1d1f] text-white hover:bg-[#0a0a0a]"
                      : ""
                  }`}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            className="rounded-xl px-4 py-2 disabled:opacity-50"
          >
            <span className="mr-1 hidden sm:inline">Next</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Results info */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}{" "}
        of {filteredProducts.length} products
      </p>
    </div>
  );
}
