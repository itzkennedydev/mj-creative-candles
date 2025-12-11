import { ProductCard } from "./product-card";
import { useProductsQuery } from "~/lib/hooks/use-products";
import Image from "next/image";
import type { Product } from "~/lib/types";
import { getProductPrice } from "~/lib/types";
import { useState, useMemo } from "react";

interface ProductGridProps {
  shopType?: "spirit-wear" | "regular-shop";
  searchQuery?: string;
  selectedCategory?: string;
  selectedSizes?: Set<string>;
  selectedPriceRanges?: Set<string>;
}

export function ProductGrid({
  shopType = "regular-shop",
  searchQuery = "",
  selectedCategory = "All",
  selectedSizes = new Set(),
  selectedPriceRanges = new Set(),
}: ProductGridProps) {
  const { data: products = [], isLoading, error } = useProductsQuery();
  const [activeSchoolTab, setActiveSchoolTab] = useState<
    | "moline"
    | "united-township"
    | "rock-island"
    | "north"
    | "elite-volleyball"
    | "all"
  >("all");

  // Helper function to map category names to product categories
  const mapCategoryToProductCategory = (category: string): string | null => {
    const categoryMap: Record<string, string> = {
      Tops: "Apparel",
      Bottoms: "Apparel",
      "T-Shirts": "Apparel", // Legacy support
      Hoodies: "Apparel", // Legacy support
      Accessories: "Accessories",
      "Limited Edition": "Apparel",
      Embroidery: "Apparel",
      "Custom Apparel": "Apparel",
      "Baby Items": "Apparel",
    };
    return categoryMap[category] || null;
  };

  // Filter products by shop type, search query, category, and size - memoized for performance
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesShopType = shopType
        ? product.shopType === shopType ||
          (!product.shopType && shopType === "regular-shop")
        : true;

      const matchesSearch =
        searchQuery.trim() === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by category - be specific, no fallback
      const matchesCategory =
        selectedCategory === "All" ||
        // Tops: includes t-shirts, hoodies, crewnecks, sweatshirts, jackets, etc.
        (selectedCategory === "Tops" &&
          product.category === "Apparel" &&
          (product.name.toLowerCase().includes("shirt") ||
            product.name.toLowerCase().includes("tee") ||
            product.name.toLowerCase().includes("t-shirt") ||
            product.name.toLowerCase().includes("hoodie") ||
            product.name.toLowerCase().includes("crewneck") ||
            product.name.toLowerCase().includes("sweatshirt") ||
            product.name.toLowerCase().includes("jacket") ||
            product.name.toLowerCase().includes("sweater")) &&
          !product.name.toLowerCase().includes("beanie") &&
          !product.name.toLowerCase().includes("hat") &&
          !product.name.toLowerCase().includes("pant") &&
          !product.name.toLowerCase().includes("short") &&
          !product.name.toLowerCase().includes("bottom")) ||
        // Legacy support for T-Shirts
        (selectedCategory === "T-Shirts" &&
          product.category === "Apparel" &&
          (product.name.toLowerCase().includes("shirt") ||
            product.name.toLowerCase().includes("tee") ||
            product.name.toLowerCase().includes("t-shirt")) &&
          !product.name.toLowerCase().includes("hoodie") &&
          !product.name.toLowerCase().includes("crewneck") &&
          !product.name.toLowerCase().includes("sweatshirt") &&
          !product.name.toLowerCase().includes("beanie") &&
          !product.name.toLowerCase().includes("hat")) ||
        // Bottoms: includes pants, shorts, leggings, etc.
        (selectedCategory === "Bottoms" &&
          product.category === "Apparel" &&
          (product.name.toLowerCase().includes("pant") ||
            product.name.toLowerCase().includes("short") ||
            product.name.toLowerCase().includes("legging") ||
            product.name.toLowerCase().includes("bottom") ||
            product.name.toLowerCase().includes("sweatpant"))) ||
        // Legacy support for Hoodies
        (selectedCategory === "Hoodies" &&
          product.category === "Apparel" &&
          (product.name.toLowerCase().includes("hoodie") ||
            product.name.toLowerCase().includes("crewneck") ||
            product.name.toLowerCase().includes("sweatshirt")) &&
          !product.name.toLowerCase().includes("beanie") &&
          !product.name.toLowerCase().includes("hat") &&
          !product.name.toLowerCase().includes("t-shirt") &&
          !product.name.toLowerCase().includes("tee")) ||
        (selectedCategory === "Accessories" &&
          (product.category === "Accessories" ||
            product.name.toLowerCase().includes("beanie") ||
            product.name.toLowerCase().includes("hat") ||
            product.name.toLowerCase().includes("bag") ||
            product.name.toLowerCase().includes("accessory"))) ||
        (selectedCategory === "Limited Edition" &&
          product.category === "Apparel" &&
          (product.name.toLowerCase().includes("limited") ||
            product.name.toLowerCase().includes("edition"))) ||
        (selectedCategory === "Embroidery" &&
          product.category === "Apparel" &&
          product.name.toLowerCase().includes("embroider")) ||
        (selectedCategory === "Custom Apparel" &&
          product.category === "Apparel" &&
          !product.name.toLowerCase().includes("spirit") &&
          !product.name.toLowerCase().includes("limited") &&
          !product.name.toLowerCase().includes("edition") &&
          !product.name.toLowerCase().includes("hoodie") &&
          !product.name.toLowerCase().includes("crewneck") &&
          !product.name.toLowerCase().includes("sweatshirt") &&
          !product.name.toLowerCase().includes("shirt") &&
          !product.name.toLowerCase().includes("tee")) ||
        (selectedCategory === "Baby Items" &&
          product.category === "Apparel" &&
          (product.name.toLowerCase().includes("baby") ||
            product.name.toLowerCase().includes("mama"))) ||
        (selectedCategory === "Elite Volleyball" &&
          product.category === "Elite Volleyball");

      // Filter by size - if sizes are selected, product must have at least one of the selected sizes
      const matchesSize =
        selectedSizes.size === 0 ||
        (product.sizes &&
          product.sizes.some((size) => selectedSizes.has(size)));

      // Filter by price range - check base price and all possible sizes (with surcharges)
      const matchesPriceRange =
        selectedPriceRanges.size === 0 ||
        (() => {
          const basePrice = getProductPrice(product);
          const prices = new Set<number>();

          // Add base price for all sizes
          if (product.sizes && product.sizes.length > 0) {
            product.sizes.forEach((size) => {
              const sizeSurcharge = size === "XXL" ? 3 : size === "3XL" ? 5 : 0;
              prices.add(basePrice + sizeSurcharge);
            });
          } else {
            prices.add(basePrice);
          }

          // Check if any price matches any selected range
          return Array.from(prices).some((price) => {
            return Array.from(selectedPriceRanges).some((range) => {
              if (range === "Under $25") return price < 25;
              if (range === "$25 - $50") return price >= 25 && price <= 50;
              if (range === "$50 - $100") return price > 50 && price <= 100;
              if (range === "Over $100") return price > 100;
              return false;
            });
          });
        })();

      return (
        matchesShopType &&
        matchesSearch &&
        matchesCategory &&
        matchesSize &&
        matchesPriceRange
      );
    });
  }, [
    products,
    shopType,
    searchQuery,
    selectedCategory,
    selectedSizes,
    selectedPriceRanges,
  ]);

  // For spirit-wear, group by school
  const groupProductsBySchool = (products: Product[]) => {
    const grouped: {
      moline: Product[];
      "united-township": Product[];
      "rock-island": Product[];
      north: Product[];
      "elite-volleyball": Product[];
      other: Product[];
    } = {
      moline: [],
      "united-township": [],
      "rock-island": [],
      north: [],
      "elite-volleyball": [],
      other: [],
    };

    products.forEach((product) => {
      if (product.category === "Elite Volleyball") {
        grouped["elite-volleyball"].push(product);
      } else if (product.school === "moline") {
        grouped.moline.push(product);
      } else if (product.school === "united-township") {
        grouped["united-township"].push(product);
      } else if (product.school === "rock-island") {
        grouped["rock-island"].push(product);
      } else if (product.school === "north") {
        grouped.north.push(product);
      } else {
        grouped.other.push(product);
      }
    });

    return grouped;
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
        <p className="mb-4 text-gray-500">No products available</p>
      </div>
    );
  }

  // For spirit-wear, show tabs for schools
  if (shopType === "spirit-wear") {
    const grouped = groupProductsBySchool(filteredProducts);
    const hasMoline = grouped.moline.length > 0;
    const hasUnitedTownship = grouped["united-township"].length > 0;
    const hasRockIsland = grouped["rock-island"].length > 0;
    const hasNorth = grouped.north.length > 0;
    const hasEliteVolleyball = grouped["elite-volleyball"].length > 0;
    const hasMultiple =
      [
        hasMoline,
        hasUnitedTownship,
        hasRockIsland,
        hasNorth,
        hasEliteVolleyball,
      ].filter(Boolean).length > 1;

    // Determine which products to show based on active tab
    const getProductsToShow = () => {
      if (activeSchoolTab === "moline") {
        return grouped.moline;
      } else if (activeSchoolTab === "united-township") {
        return grouped["united-township"];
      } else if (activeSchoolTab === "rock-island") {
        return grouped["rock-island"];
      } else if (activeSchoolTab === "north") {
        return grouped.north;
      } else if (activeSchoolTab === "elite-volleyball") {
        return grouped["elite-volleyball"];
      } else {
        // Show all products
        return [
          ...grouped.moline,
          ...grouped["united-township"],
          ...grouped["rock-island"],
          ...grouped.north,
          ...grouped["elite-volleyball"],
          ...grouped.other,
        ];
      }
    };

    const productsToShow = getProductsToShow();

    return (
      <div className="space-y-6">
        {/* School Tabs */}
        {(hasMoline ||
          hasUnitedTownship ||
          hasRockIsland ||
          hasNorth ||
          hasEliteVolleyball) && (
          <div className="grid grid-cols-1 gap-2 border-b border-black/[0.06] pb-3 sm:flex sm:flex-wrap sm:gap-3 sm:pb-4">
            {hasMultiple && (
              <button
                onClick={() => setActiveSchoolTab("all")}
                className={`w-full touch-manipulation justify-center whitespace-nowrap rounded-md px-4 py-3.5 text-sm font-medium transition-all duration-200 sm:w-auto sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base ${
                  activeSchoolTab === "all"
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]"
                }`}
              >
                All Schools
              </button>
            )}
            {hasMoline && (
              <button
                onClick={() => setActiveSchoolTab("moline")}
                className={`flex w-full touch-manipulation items-center justify-center gap-1.5 rounded-md px-4 py-3.5 text-sm font-medium transition-all duration-200 sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base ${
                  activeSchoolTab === "moline"
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]"
                }`}
              >
                <div className="relative h-5 w-5 flex-shrink-0 sm:h-5 sm:w-5">
                  <Image
                    src="/schools/moline-logo.png"
                    alt="Moline"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <span className="whitespace-nowrap">Moline High School</span>
              </button>
            )}
            {hasUnitedTownship && (
              <button
                onClick={() => setActiveSchoolTab("united-township")}
                className={`flex w-full touch-manipulation items-center justify-center gap-1.5 rounded-md px-4 py-3.5 text-sm font-medium transition-all duration-200 sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base ${
                  activeSchoolTab === "united-township"
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]"
                }`}
              >
                <div className="relative h-5 w-5 flex-shrink-0 sm:h-5 sm:w-5">
                  <Image
                    src="/schools/united-township-logo.png"
                    alt="United Township"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <span className="whitespace-nowrap">
                  United Township High School
                </span>
              </button>
            )}
            {hasRockIsland && (
              <button
                onClick={() => setActiveSchoolTab("rock-island")}
                className={`flex w-full touch-manipulation items-center justify-center gap-1.5 rounded-md px-4 py-3.5 text-sm font-medium transition-all duration-200 sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base ${
                  activeSchoolTab === "rock-island"
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]"
                }`}
              >
                <div className="relative h-5 w-5 flex-shrink-0 sm:h-5 sm:w-5">
                  <Image
                    src="/schools/rock-island-logo.png"
                    alt="Rock Island"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <span className="whitespace-nowrap">
                  Rock Island High School
                </span>
              </button>
            )}
            {hasNorth && (
              <button
                onClick={() => setActiveSchoolTab("north")}
                className={`flex w-full touch-manipulation items-center justify-center gap-1.5 rounded-md px-4 py-3.5 text-sm font-medium transition-all duration-200 sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base ${
                  activeSchoolTab === "north"
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]"
                }`}
              >
                <div className="relative h-5 w-5 flex-shrink-0 sm:h-5 sm:w-5">
                  <Image
                    src="/schools/North.png"
                    alt="Wildcats"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <span className="whitespace-nowrap">Wildcats</span>
              </button>
            )}
            {hasEliteVolleyball && (
              <button
                onClick={() => setActiveSchoolTab("elite-volleyball")}
                className={`flex w-full touch-manipulation items-center justify-center gap-1.5 rounded-md px-4 py-3.5 text-sm font-medium transition-all duration-200 sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base ${
                  activeSchoolTab === "elite-volleyball"
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-black/[0.03] text-black/[0.72] hover:bg-black/[0.06]"
                }`}
              >
                <div className="relative h-5 w-5 flex-shrink-0 sm:h-5 sm:w-5">
                  <Image
                    src="/schools/EliteLogo.png"
                    alt="Elite Volleyball"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
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
          <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
            {productsToShow.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center sm:py-12">
            <p className="mb-4 text-[13px] text-gray-500 sm:text-[14px]">
              No products available for this school
            </p>
          </div>
        )}
      </div>
    );
  }

  // For regular shop, show normal grid
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
