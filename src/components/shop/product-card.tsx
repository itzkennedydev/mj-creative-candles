"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "~/lib/types";
import { getOptimizedImageUrl } from "~/lib/types";
import { Button } from "~/components/ui/button";
import { ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useCart } from "~/lib/cart-context";
import { useToast } from "~/lib/toast-context";
import { generateProductStructuredData } from "~/lib/seo";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [customColorValue, setCustomColorValue] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addItem } = useCart();
  const { addToast } = useToast();

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

  const allImages = product.image ? [
    { src: getImageUrl(product.imageId ?? '', product.image), isPrimary: true },
    ...(product.images ?? []).map(img => ({ src: getImageUrl(img.imageId, img.dataUri), isPrimary: false }))
  ] : (product.images ?? []).map(img => ({ src: getImageUrl(img.imageId, img.dataUri), isPrimary: false }));

  // Calculate price with XXL and 3XL surcharge
  const displayPrice = product.price + (selectedSize === 'XXL' ? 3 : selectedSize === '3XL' ? 5 : 0);

  // Set default selections when component mounts if there's only one option
  useEffect(() => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      const firstSize = product.sizes[0];
      if (firstSize) {
        setSelectedSize(firstSize);
      }
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      const firstColor = product.colors[0];
      if (firstColor) {
        setSelectedColor(firstColor);
      }
    }
  }, [product.sizes, product.colors, selectedSize, selectedColor]);

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

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 1 && !selectedSize) {
      addToast({
        title: "Size Required",
        description: "Please select a size before adding to cart.",
        type: "warning"
      });
      return;
    }
    if (product.colors && product.colors.length > 1 && !selectedColor) {
      addToast({
        title: "Color Required",
        description: "Please select a color before adding to cart.",
        type: "warning"
      });
      return;
    }
    if (selectedColor === "Custom" && !customColorValue.trim()) {
      addToast({
        title: "Custom Color Required",
        description: "Please specify your custom color.",
        type: "warning"
      });
      return;
    }
    
    addItem(product, quantity, selectedSize, selectedColor, selectedColor === "Custom" ? customColorValue : undefined);
    addToast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      type: "success"
    });
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
        <div className="aspect-square relative mb-6 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
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
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-black p-2 rounded-full transition-all duration-200 z-20 shadow-lg active:scale-95"
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
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black p-3 rounded-full transition-all duration-200 shadow-lg z-50"
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
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-4 rounded-full transition-all duration-200 z-50 shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-4 rounded-full transition-all duration-200 z-50 shadow-lg"
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
      
      {/* Product Details */}
        <div className="space-y-4 md:space-y-6 flex-1 flex flex-col">
          <div className="flex-shrink-0">
            <Link href={`/shop/${product.id}`}>
              <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2 line-clamp-2 hover:text-gray-700 transition-colors cursor-pointer" itemProp="name">{product.name}</h3>
            </Link>
            <p className="text-sm md:text-base text-gray-600 line-clamp-3" itemProp="description">{product.description}</p>
            
            {/* Special Instructions for Mama Keepsake Sweatshirt */}
            {product.requiresBabyClothes && (
              <div className="mt-3 p-3 bg-[#FFF4E6] border border-[#FF8C00] rounded-md">
                <p className="text-sm font-medium text-[#CC6600] mb-1">Don&apos;t forget to bring your baby clothes!</p>
                <p className="text-xs text-[#B35900]">
                    Please bring your baby clothes within {product.babyClothesDeadlineDays ?? 5} days of placing your order.
                </p>
              </div>
            )}
          </div>
          
          <div className="text-xl md:text-2xl font-medium text-gray-900 flex-shrink-0">
            <span itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span itemProp="price" content={displayPrice.toString()}>${displayPrice.toFixed(2)}</span>
              <meta itemProp="priceCurrency" content="USD" />
              <meta itemProp="availability" content={product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
            </span>
          </div>

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Size</label>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 md:px-4 py-2 text-sm border rounded-md transition-colors ${
                      isSelected
                        ? "border-[#74CADC] bg-[#74CADC] text-[#0A5565]"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Color Selection */}
        {product.colors && product.colors.length > 1 && (
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Color</label>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {product.colors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setCustomColorValue("");
                    }}
                    className={`px-3 md:px-4 py-2 text-sm border rounded-md transition-colors ${
                      isSelected
                        ? "border-[#74CADC] bg-[#74CADC] text-[#0A5565]"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
              {/* Custom Color Option for Keepsake Sweater */}
              {product.requiresBabyClothes && (
                <button
                  onClick={() => setSelectedColor("Custom")}
                  className={`px-3 md:px-4 py-2 text-sm border rounded-md transition-colors ${
                    selectedColor === "Custom"
                      ? "border-[#74CADC] bg-[#74CADC] text-[#0A5565]"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  Custom 🎨
                </button>
              )}
            </div>
            {/* Custom Color Input */}
            {selectedColor === "Custom" && product.requiresBabyClothes && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customColorValue}
                  onChange={(e) => setCustomColorValue(e.target.value)}
                  placeholder="Enter your custom color"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            )}
          </div>
        )}

        {/* Quantity Selector */}
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Quantity</label>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-3 md:px-4 py-2 border border-gray-300 rounded-md min-w-[3rem] md:min-w-[4rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-auto pt-4">
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-2 md:py-3 text-sm md:text-base font-medium"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" />
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
}