"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "~/lib/types";
import { getOptimizedImageUrl } from "~/lib/types";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { generateProductStructuredData } from "~/lib/seo";

interface ProductCardProps {
  product: Product;
}

function ProductCardComponent({ product }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Create array of all images including primary with optimized URLs
  // Only use optimization endpoint if we have an imageId, otherwise use the dataUri directly
  const getImageUrl = (imageId: string, dataUri: string) => {
    // If it's a data URI and we have an imageId, use the optimization endpoint
    if (dataUri.startsWith("data:") && imageId && imageId.length > 10) {
      return getOptimizedImageUrl(imageId, dataUri, 600);
    }
    // Otherwise just return the dataUri as-is (for old uploads or direct data URIs)
    return dataUri;
  };

  const allImages = useMemo(() => {
    return product.image
      ? [
          {
            src: getImageUrl(product.imageId ?? "", product.image),
            isPrimary: true,
          },
          ...(product.images ?? []).map((img) => ({
            src: getImageUrl(img.imageId, img.dataUri),
            isPrimary: false,
          })),
        ]
      : (product.images ?? []).map((img) => ({
          src: getImageUrl(img.imageId, img.dataUri),
          isPrimary: false,
        }));
  }, [product.image, product.imageId, product.images]);

  // Map colors to image indices based on image filenames
  const getImageIndexForColor = useCallback(
    (color: string): number | null => {
      if (!product.colors || product.colors.length <= 1) return null;

      const colorLower = color.toLowerCase();

      // Try to match color names to image filenames - require SPECIFIC color word
      for (let i = 0; i < allImages.length; i++) {
        const imageSrc = allImages[i]?.src ?? "";
        const imageSrcLower = imageSrc.toLowerCase();

        // Beanie-specific color mappings - match specific color keywords
        if (
          colorLower.includes("forest green") &&
          imageSrcLower.includes("forest")
        )
          return i;
        if (
          colorLower.includes("gold") &&
          colorLower.includes("white") &&
          imageSrcLower.includes("gold")
        )
          return i;
        if (colorLower.includes("icon grey") && imageSrcLower.includes("icon"))
          return i;
        if (colorLower.includes("maroon") && imageSrcLower.includes("maroon"))
          return i;
        if (
          colorLower.includes("pink raspberry") &&
          imageSrcLower.includes("pink")
        )
          return i;
        if (colorLower.includes("purple") && imageSrcLower.includes("purple"))
          return i;
        if (
          colorLower.includes("red") &&
          colorLower.includes("black") &&
          !colorLower.includes("royal") &&
          imageSrcLower.includes("red:black")
        )
          return i;
        if (
          colorLower.includes("red") &&
          colorLower.includes("royal") &&
          imageSrcLower.includes("red:royal")
        )
          return i;
        if (colorLower.includes("true royal") && imageSrcLower.includes("true"))
          return i;
        if (
          colorLower.includes("black on black") &&
          imageSrcLower.includes("blackonblack")
        )
          return i;
        if (
          colorLower.includes("moline black") &&
          imageSrcLower.includes("molineblack")
        )
          return i;
        if (colorLower.includes("royal blue") && imageSrcLower.includes("blue"))
          return i;
        if (
          colorLower === "moline" &&
          imageSrcLower.includes("beanie") &&
          !imageSrcLower.includes("black")
        )
          return i;
        // Generic fallbacks (less specific, checked last)
        if (
          colorLower === "black" &&
          imageSrcLower.includes("black") &&
          !imageSrcLower.includes("maroon") &&
          !imageSrcLower.includes("purple") &&
          !imageSrcLower.includes("red")
        )
          return i;
        if (colorLower === "blue" && imageSrcLower.includes("blue")) return i;
        if (colorLower === "white" && imageSrcLower.includes("white")) return i;
        if (colorLower === "red" && imageSrcLower.includes("red")) return i;
      }

      return null;
    },
    [allImages, product.colors],
  );

  // Base price (surcharges shown on detail page)
  // Support both MJ Creative Candles (price) and MJ Candles (salePrice/regularPrice) schemas
  const displayPrice =
    product.salePrice ?? product.price ?? product.regularPrice ?? 0;

  // Set default color selection when component mounts
  useEffect(() => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      const firstColor = product.colors[0];
      if (firstColor) {
        setSelectedColor(firstColor);
      }
    }
  }, [product.colors, selectedColor]);

  // Update image when color selection changes
  useEffect(() => {
    if (selectedColor && product.colors && product.colors.length > 1) {
      const imageIndex = getImageIndexForColor(selectedColor);
      if (
        imageIndex !== null &&
        imageIndex >= 0 &&
        imageIndex < allImages.length
      ) {
        setCurrentImageIndex(imageIndex);
      }
    }
  }, [selectedColor, getImageIndexForColor, allImages.length]);

  // Handle Escape key to close expanded view
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0]?.clientX ?? 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? 0);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  return (
    <article
      className="flex h-full flex-col bg-white"
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateProductStructuredData({
              id: product.id,
              name: product.name,
              description: product.description,
              price: displayPrice,
              image: allImages[0]?.src ?? "/placeholder.jpg",
              inStock: product.inStock,
              brand: "MJ Creative Candles",
            }),
          ),
        }}
      />
      {/* Product Image - Clickable to product detail */}
      <Link href={`/shop/${product.id}`}>
        <div
          className="relative mb-4 aspect-square flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-100"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="img"
          aria-label={`${product.name} product image`}
        >
          {allImages.length > 0 && (
            <Image
              src={allImages[currentImageIndex]?.src ?? "/placeholder.jpg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              priority={currentImageIndex === 0} // Load first image with priority
              loading={currentImageIndex === 0 ? undefined : "lazy"}
            />
          )}

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="font-medium text-white">Out of Stock</span>
            </div>
          )}

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {currentImageIndex < allImages.length - 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </>
          )}

          {/* Image Navigation Dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-2">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentImageIndex(idx);
                  }}
                  className={`h-2 w-2 rounded-full transition-all ${
                    currentImageIndex === idx ? "w-8 bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Expand Icon */}
          {allImages.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsExpanded(true);
              }}
              className="absolute right-2 top-2 z-20 rounded-full border border-gray-200 bg-white p-2 text-black transition-colors duration-200 hover:bg-gray-100"
              aria-label="Expand image"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </Link>

      {/* Expanded Image Modal */}
      {isExpanded && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute right-4 top-4 z-50 rounded-full bg-white p-3 text-black transition-colors duration-200 hover:bg-gray-100"
            aria-label="Close expanded view"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(
                    currentImageIndex > 0
                      ? currentImageIndex - 1
                      : allImages.length - 1,
                  );
                }}
                className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white p-4 text-black transition-colors duration-200 hover:bg-gray-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(
                    currentImageIndex < allImages.length - 1
                      ? currentImageIndex + 1
                      : 0,
                  );
                }}
                className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white p-4 text-black transition-colors duration-200 hover:bg-gray-100"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Expanded Image */}
          <div
            className="relative h-full max-h-[90vh] w-full max-w-7xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[currentImageIndex]?.src ?? "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Image Dots Indicator */}
          {allImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 gap-x-2">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    currentImageIndex === idx
                      ? "bg-white"
                      : "bg-white/30 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Details - Simplified for consistent heights */}
      <div className="flex flex-1 flex-col">
        {/* Product Info */}
        <div className="flex-1">
          <Link href={`/shop/${product.id}`}>
            <h3
              className="mb-1 line-clamp-1 cursor-pointer text-base font-semibold text-gray-900 transition-colors hover:text-[#1d1d1f]"
              itemProp="name"
            >
              {product.name}
            </h3>
          </Link>
          <p
            className="mb-3 line-clamp-2 text-sm text-gray-500"
            itemProp="description"
          >
            {product.description}
          </p>

          {/* Quick info badges */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {product.colors && product.colors.length > 1 && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                {product.colors.length} colors
              </span>
            )}
            {product.sizes && product.sizes.length > 1 && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                {product.sizes.length} sizes
              </span>
            )}
            {new Date() < new Date("2025-12-02T05:59:59Z") && (
              <span className="rounded-full bg-[#f5f5f5] px-2 py-1 text-xs font-medium text-[#1d1d1f]">
                15% OFF
              </span>
            )}
          </div>
        </div>

        {/* Price and CTA - Always at bottom */}
        <div className="mt-auto border-t border-gray-100 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <span
              className="text-lg font-bold text-gray-900"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <span itemProp="price" content={displayPrice.toString()}>
                ${displayPrice.toFixed(2)}
              </span>
              <meta itemProp="priceCurrency" content="USD" />
              <meta
                itemProp="availability"
                content={
                  product.inStock
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock"
                }
              />
            </span>
            {!product.inStock && (
              <span className="text-xs font-medium text-red-500">
                Out of Stock
              </span>
            )}
          </div>

          <Link href={`/shop/${product.id}`} className="block">
            <Button
              disabled={!product.inStock}
              className="w-full rounded-xl bg-[#1d1d1f] py-3 text-sm font-medium text-white transition-colors hover:bg-[#0a0a0a]"
            >
              {product.inStock ? "View Product" : "Out of Stock"}
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

// Memoize ProductCard to prevent unnecessary re-renders
export const ProductCard = memo(
  ProductCardComponent,
  (prevProps, nextProps) => {
    // Only re-render if product ID or key properties change
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.inStock === nextProps.product.inStock &&
      prevProps.product.image === nextProps.product.image &&
      JSON.stringify(prevProps.product.sizes) ===
        JSON.stringify(nextProps.product.sizes) &&
      JSON.stringify(prevProps.product.colors) ===
        JSON.stringify(nextProps.product.colors)
    );
  },
);
