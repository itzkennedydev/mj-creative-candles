"use client";

import { useState } from "react";

export function ShopSidebar() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("All");

  const categories = ["All", "Apparel", "Headwear", "Accessories"];
  const priceRanges = ["All", "Under $20", "$20 - $40", "$40 - $60", "Over $60"];

  return (
    <div className="w-full bg-gray-50 rounded-lg p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-8">Filters</h3>
      
      {/* Category Filter */}
      <div className="mb-8">
        <h4 className="text-base font-semibold text-gray-900 mb-4">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                selectedCategory === category
                  ? "text-gray-900 font-medium bg-white border border-gray-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-8">
        <h4 className="text-base font-semibold text-gray-900 mb-4">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedPriceRange(range)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                selectedPriceRange === range
                  ? "text-gray-900 font-medium bg-white border border-gray-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button className="text-sm text-gray-500 hover:text-gray-700 underline font-medium">
        Clear all filters
      </button>
    </div>
  );
}
