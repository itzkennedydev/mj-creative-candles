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
    if (dataUri.startsWith('data:') && imageId && imageId.length > 10) {
      return getOptimizedImageUrl(imageId, dataUri, 600);
    }
    // Otherwise just return the dataUri as-is (for old uploads or direct data URIs)
    return dataUri;
  };

  const allImages = useMemo(() => {
    return product.image ? [
      { src: getImageUrl(product.imageId ?? '', product.image), isPrimary: true },
      ...(product.images ?? []).map(img => ({ src: getImageUrl(img.imageId, img.dataUri), isPrimary: false }))
    ] : (product.images ?? []).map(img => ({ src: getImageUrl(img.imageId, img.dataUri), isPrimary: false }));
  }, [product.image, product.imageId, product.images]);

  // Map colors to image indices based on image filenames
  const getImageIndexForColor = useCallback((color: string): number | null => {
    if (!product.colors || product.colors.length <= 1) return null;
    
    const colorLower = color.toLowerCase();
    
    // Try to match color names to image filenames - require SPECIFIC color word
    for (let i = 0; i < allImages.length; i++) {
      const imageSrc = allImages[i]?.src ?? '';
      const imageSrcLower = imageSrc.toLowerCase();
      
      // Beanie-specific color mappings - match specific color keywords
      if (colorLower.includes('forest green') && imageSrcLower.includes('forest')) return i;
      if (colorLower.includes('gold') && colorLower.includes('white') && imageSrcLower.includes('gold')) return i;
      if (colorLower.includes('icon grey') && imageSrcLower.includes('icon')) return i;
      if (colorLower.includes('maroon') && imageSrcLower.includes('maroon')) return i;
      if (colorLower.includes('pink raspberry') && imageSrcLower.includes('pink')) return i;
      if (colorLower.includes('purple') && imageSrcLower.includes('purple')) return i;
      if (colorLower.includes('red') && colorLower.includes('black') && !colorLower.includes('royal') && imageSrcLower.includes('red:black')) return i;
      if (colorLower.includes('red') && colorLower.includes('royal') && imageSrcLower.includes('red:royal')) return i;
      if (colorLower.includes('true royal') && imageSrcLower.includes('true')) return i;
      if (colorLower.includes('black on black') && imageSrcLower.includes('blackonblack')) return i;
      if (colorLower.includes('moline black') && imageSrcLower.includes('molineblack')) return i;
      if (colorLower.includes('royal blue') && imageSrcLower.includes('blue')) return i;
      if (colorLower === 'moline' && imageSrcLower.includes('beanie') && !imageSrcLower.includes('black')) return i;
      // Generic fallbacks (less specific, checked last)
      if (colorLower === 'black' && imageSrcLower.includes('black') && !imageSrcLower.includes('maroon') && !imageSrcLower.includes('purple') && !imageSrcLower.includes('red')) return i;
      if (colorLower === 'blue' && imageSrcLower.includes('blue')) return i;
      if (colorLower === 'white' && imageSrcLower.includes('white')) return i;
      if (colorLower === 'red' && imageSrcLower.includes('red')) return i;
    }
    
    return null;
  }, [allImages, product.colors]);

  // Base price (surcharges shown on detail page)
  const displayPrice = product.price;

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
      if (imageIndex !== null && imageIndex >= 0 && imageIndex < allImages.length) {
        setCurrentImageIndex(imageIndex);
      }
    }
  }, [selectedColor, getImageIndexForColor, allImages.length]);

  // Handle Escape key to close expanded view
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
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
    <article className="bg-white h-full flex flex-col" itemScope itemType="https://schema.org/Product">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductStructuredData({
            id: product.id,
            name: product.name,
            description: product.description,
            price: displayPrice,
            image: allImages[0]?.src ?? '/placeholder.jpg',
            inStock: product.inStock,
            brand: 'Stitch Please',
          })),
        }}
      />
      {/* Product Image - Clickable to product detail */}
      <Link href={`/shop/${product.id}`}>
        <div className="aspect-square relative mb-4 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border border-gray-100"
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}
             role="img"
             aria-label={`${product.name} product image`}>
        {allImages.length > 0 && (
          <Image
            src={allImages[currentImageIndex]?.src ?? '/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={currentImageIndex === 0} // Load first image with priority
            loading={currentImageIndex === 0 ? undefined : 'lazy'}
          />
        )}
        
        
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
        
        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {currentImageIndex < allImages.length - 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </>
        )}
        
        {/* Image Navigation Dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentImageIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentImageIndex === idx ? 'bg-white w-8' : 'bg-white/50'
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
            className="absolute top-2 right-2 bg-white hover:bg-gray-100 text-black p-2 rounded-full transition-colors duration-200 z-20 border border-gray-200"
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
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-black p-3 rounded-full transition-colors duration-200 z-50"
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
                  setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-black p-4 rounded-full transition-colors duration-200 z-50"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-black p-4 rounded-full transition-colors duration-200 z-50"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Expanded Image */}
          <div 
            className="relative w-full h-full max-w-7xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[currentImageIndex]?.src ?? '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Image Dots Indicator */}
          {allImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-x-2 z-50">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentImageIndex === idx ? 'bg-white' : 'bg-white/30 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Product Details - Simplified for consistent heights */}
        <div className="flex flex-col flex-1">
          {/* Product Info */}
          <div className="flex-1">
            <Link href={`/shop/${product.id}`}>
              <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-[#0A5565] transition-colors cursor-pointer" itemProp="name">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3" itemProp="description">
              {product.description}
            </p>
            
            {/* Quick info badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.colors && product.colors.length > 1 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {product.colors.length} colors
                </span>
              )}
              {product.sizes && product.sizes.length > 1 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {product.sizes.length} sizes
                </span>
              )}
              {new Date() < new Date('2025-12-02T05:59:59Z') && (
                <span className="text-xs text-[#0A5565] bg-[#E6F7FA] px-2 py-1 rounded-full font-medium">
                  15% OFF
                </span>
              )}
            </div>
          </div>

          {/* Price and CTA - Always at bottom */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-gray-900" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <span itemProp="price" content={displayPrice.toString()}>${displayPrice.toFixed(2)}</span>
                <meta itemProp="priceCurrency" content="USD" />
                <meta itemProp="availability" content={product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
              </span>
              {!product.inStock && (
                <span className="text-xs text-red-500 font-medium">Out of Stock</span>
              )}
            </div>
            
            <Link href={`/shop/${product.id}`} className="block">
              <Button
                disabled={!product.inStock}
                className="w-full bg-[#0A5565] hover:bg-[#083d4a] text-white py-3 text-sm font-medium rounded-xl transition-colors"
              >
                {product.inStock ? 'View Product' : 'Out of Stock'}
              </Button>
            </Link>
          </div>
        </div>
    </article>
  );
}

// Memoize ProductCard to prevent unnecessary re-renders
export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  // Only re-render if product ID or key properties change
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.inStock === nextProps.product.inStock &&
    prevProps.product.image === nextProps.product.image &&
    JSON.stringify(prevProps.product.sizes) === JSON.stringify(nextProps.product.sizes) &&
    JSON.stringify(prevProps.product.colors) === JSON.stringify(nextProps.product.colors)
  );
});