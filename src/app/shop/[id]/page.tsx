"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { useCart } from "~/lib/cart-context";
import { useToast } from "~/lib/toast-context";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "~/lib/types";
import { getOptimizedImageUrl } from "~/lib/types";
import { trackViewItem } from "~/lib/analytics";

async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${id}`);
  if (!response.ok) {
    try {
      const errorData = await response.json() as { error?: string };
      throw new Error(errorData.error ?? `Failed to fetch product: ${response.status}`);
    } catch {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
  }
  return response.json() as Promise<Product>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [customColorValue, setCustomColorValue] = useState<string>("");
  const quantity = 1;
  const [activeTab, setActiveTab] = useState<string>("product");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const { addItem } = useCart();
  const { addToast } = useToast();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const imageRef = useRef<HTMLDivElement>(null);

  // Debug log
  useEffect(() => {
    if (productId) {
      console.log('Product ID:', productId);
    } else {
      console.warn('Product ID is missing');
    }
  }, [productId]);

  // Handle Escape key to close expanded view
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      return fetchProduct(productId);
    },
    enabled: !!productId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if data exists in cache
  });

  // Track product view analytics
  useEffect(() => {
    if (product) {
      trackViewItem(product.id ?? '', product.name, product.price);
    }
  }, [product]);

  // Get all images
  const getImageUrl = (imageId: string, dataUri: string) => {
    if (dataUri.startsWith('data:') && imageId && imageId.length > 10) {
      return getOptimizedImageUrl(imageId, dataUri, 1200);
    }
    return dataUri;
  };

  const allImages = useMemo(() => {
    if (!product) return [];
    return product.image ? [
      { src: getImageUrl(product.imageId ?? '', product.image), isPrimary: true },
      ...(product.images ?? []).map(img => ({ 
        src: getImageUrl(img.imageId, img.dataUri), 
        isPrimary: false 
      }))
    ] : (product.images ?? []).map(img => ({ 
      src: getImageUrl(img.imageId, img.dataUri), 
      isPrimary: false 
    }));
  }, [product]);

  // Map colors to image indices based on image filenames
  const getImageIndexForColor = useCallback((color: string): number | null => {
    if (!product?.colors || product.colors.length <= 1 || !allImages.length) return null;
    
    const colorLower = color.toLowerCase();
    
    // Try to match color names to image filenames (check more specific matches first)
    for (let i = 0; i < allImages.length; i++) {
      const imageSrc = allImages[i]?.src ?? '';
      const imageSrcLower = imageSrc.toLowerCase();
      
      // More specific matches first
      if (colorLower.includes('black on black') && (imageSrcLower.includes('blackonblack') || imageSrcLower.includes('black-on-black'))) {
        return i;
      }
      if (colorLower.includes('moline black') && (imageSrcLower.includes('molineblack') || imageSrcLower.includes('moline-black'))) {
        return i;
      }
      if (colorLower.includes('royal blue') && imageSrcLower.includes('blue')) {
        return i;
      }
      // General matches
      if (colorLower.includes('black') && imageSrcLower.includes('black') && !imageSrcLower.includes('molineblack') && !imageSrcLower.includes('blackonblack')) {
        return i;
      }
      if (colorLower.includes('blue') && imageSrcLower.includes('blue')) {
        return i;
      }
      // Add more color mappings as needed
      if (colorLower.includes('white') && imageSrcLower.includes('white')) {
        return i;
      }
      if (colorLower.includes('red') && imageSrcLower.includes('red')) {
        return i;
      }
      // Match "Moline" to Beanie.png (default/primary image)
      if (colorLower === 'moline' && (imageSrcLower.includes('beanie') && !imageSrcLower.includes('black'))) {
        return i;
      }
    }
    
    return null;
  }, [allImages, product?.colors]);

  // Set default selections
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0] ?? "");
      }
      if (product.colors && product.colors.length > 1 && !selectedColor) {
        setSelectedColor(product.colors[0] ?? "");
      }
    }
  }, [product, selectedSize, selectedColor]);

  // Update image when color selection changes
  useEffect(() => {
    if (selectedColor && product?.colors && product.colors.length > 1 && allImages.length > 0) {
      const imageIndex = getImageIndexForColor(selectedColor);
      if (imageIndex !== null && imageIndex >= 0 && imageIndex < allImages.length) {
        setCurrentImageIndex(imageIndex);
      }
    }
  }, [selectedColor, getImageIndexForColor]);

  const handleAddToCart = () => {
    if (!product) return;
    
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

  const displayPrice = product ? product.price + (selectedSize === 'XXL' ? 3 : selectedSize === '3XL' ? 5 : 0) : 0;

  // Handle swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && allImages.length > 1) {
      // Swipe left - next image
      setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    } else if (distance < -minSwipeDistance && allImages.length > 1) {
      // Swipe right - previous image
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Handle mouse move for zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  };

  // Handle mouse enter/leave for zoom
  const handleMouseEnter = () => {
    // Only enable zoom on desktop (md and above) - check via media query
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Product fetch error:', error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'Failed to load product'}
          </p>
          <Link href="/shop">
            <button className="px-6 py-3 bg-black/80 text-white rounded-full hover:bg-black transition-colors">
              Back to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Product not found</p>
          <Link href="/shop">
            <button className="px-6 py-3 bg-black/80 text-white rounded-full hover:bg-black transition-colors">
              Back to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white pt-[20px] sm:pt-[24px] md:pt-[32px] lg:pt-[40px] pb-[16px] md:pb-[12px] lg:pb-[16px]">
      <Container className="pb-[16px] md:pb-[12px] lg:pb-[16px]">
        <div className="md:grid md:grid-cols-[1fr_1fr] md:gap-x-[16px] lg:gap-x-[20px] xl:grid-cols-[1fr_330px] xl:gap-x-[24px] lg:relative">
          {/* Left Panel - Product Images */}
          <section 
            ref={imageContainerRef}
            className="h-[480px] xs:h-[520px] sm:h-[560px] md:h-[600px] lg:h-[calc(90svh-84px)] overflow-hidden rounded-[20px] sm:rounded-[24px] md:rounded-[32px] lg:rounded-[40px] relative lg:overflow-hidden lg:sticky lg:top-[59px] touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="swiper h-full overflow-hidden rounded-[20px] sm:rounded-[24px] md:rounded-[32px] lg:rounded-[40px] bg-[#F1F1EF] flex w-full">
              <div 
                ref={imageRef}
                className="relative bg-[#F1F1EF] w-full h-full cursor-zoom-in md:cursor-crosshair md:group"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {allImages.length > 0 && (
                  <>
                    <div className="transition-opacity duration-300 opacity-100 relative h-full z-10 overflow-hidden">
                      <Image
                        src={allImages[currentImageIndex]?.src ?? '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className={`w-full h-full transition-opacity duration-500 object-cover relative object-top ${
                          isZoomed ? 'md:scale-150' : ''
                        }`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, calc(100vw - 354px)"
                        priority
                        style={{ 
                          color: 'transparent',
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          transition: isZoomed ? 'none' : 'transform 0.3s ease-out'
                        }}
                      />
                    </div>
                    
                    {/* Zoom indicator hint - only show on desktop when not zoomed */}
                    {!isZoomed && (
                      <div className="hidden md:block absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full z-30 pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        Hover to zoom • Move to pan
                      </div>
                    )}
                    
                    {/* Navigation Arrows - Show on tablet and desktop */}
                    {allImages.length > 1 && (
                      <div className="hidden md:block">
                        <button
                          onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1)}
                          className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2.5 md:p-3 rounded-full transition-all duration-200 z-20 shadow-lg active:scale-95"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0)}
                          className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2.5 md:p-3 rounded-full transition-all duration-200 z-20 shadow-lg active:scale-95"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                      </div>
                    )}
                    
                    {/* Mobile Navigation Arrows */}
                    {allImages.length > 1 && (
                      <div className="md:hidden flex justify-between items-center absolute inset-0 z-20 pointer-events-none">
                        <button
                          onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1)}
                          className="pointer-events-auto bg-white/80 active:bg-white text-black p-2.5 rounded-full transition-all duration-200 shadow-lg ml-3 active:scale-95"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0)}
                          className="pointer-events-auto bg-white/80 active:bg-white text-black p-2.5 rounded-full transition-all duration-200 shadow-lg mr-3 active:scale-95"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Image Dots Indicator */}
            {allImages.length > 1 && (
              <div className="absolute bottom-[10px] sm:bottom-[12px] md:bottom-[16px] left-1/2 translate-x-[-50%] z-10 flex gap-x-[4px]">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-[5px] h-[5px] sm:w-[6px] sm:h-[6px] md:w-[8px] md:h-[8px] rounded-full transition-all duration-300 ${
                      currentImageIndex === idx ? 'bg-white' : 'bg-white/30 hover:bg-white/70 active:bg-white/50'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Expand Icon */}
            {allImages.length > 0 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-4 md:right-4 bg-white/90 hover:bg-white text-black p-2 sm:p-2.5 md:p-3 rounded-full transition-all duration-200 z-20 shadow-lg active:scale-95"
                aria-label="Expand image"
              >
                <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </button>
            )}
          </section>

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

        {/* Right Panel - Product Details */}
        <div className="min-h-[600px] md:h-[600px] lg:h-[calc(90svh-84px)] md:flex md:flex-col md:items-center md:justify-center lg:w-full relative lg:sticky lg:top-[59px]">
          <div className="w-full">
            <div className="max-w-[438px] mx-auto md:max-w-[unset] md:mx-[unset] md:w-full">
              <section className="pt-[24px] sm:pt-[28px] md:pt-0 text-black/[0.72] md:w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end md:flex-col md:items-center md:justify-center gap-y-4 sm:gap-y-0">
                  <div className="md:flex md:flex-col md:justify-center md:items-center w-full">
                    {/* Product Name - Split into bold and regular parts */}
                    <h1 className="text-[18px] sm:text-[20px] md:text-[22px] lg:text-[20px] leading-[130%] font-bold">
                      {product.name.split(' ')[0]}
                    </h1>
                    <span className="text-[18px] sm:text-[20px] md:text-[22px] lg:text-[20px] leading-[130%]">
                      {product.name.split(' ').slice(1).join(' ')}
                    </span>
                    
                    {/* Tabs */}
                    <div className="flex gap-x-[8px] justify-start sm:justify-start md:justify-center mt-[8px] sm:mt-[10px] md:mt-[12px] overflow-x-auto pb-1 scrollbar-hide">
                      <button
                        className={`px-[18px] sm:px-[22px] py-[10px] sm:py-[11px] rounded-full text-[13px] sm:text-[14px] border-[2px] leading-[130%] transition-colors duration-300 whitespace-nowrap flex-shrink-0 ${
                          activeTab === 'product' 
                            ? 'border-black/[0.12]' 
                            : 'border-black/[0.06] hover:border-black/[0.12] active:border-black/[0.12]'
                        }`}
                        onClick={() => setActiveTab('product')}
                      >
                        Product
                      </button>
                      <button
                        className={`px-[18px] sm:px-[22px] py-[10px] sm:py-[11px] rounded-full text-[13px] sm:text-[14px] border-[2px] leading-[130%] transition-colors duration-300 whitespace-nowrap flex-shrink-0 ${
                          activeTab === 'faq' 
                            ? 'border-black/[0.12]' 
                            : 'border-black/[0.06] hover:border-black/[0.12] active:border-black/[0.12]'
                        }`}
                        onClick={() => setActiveTab('faq')}
                      >
                        FAQ
                      </button>
                    </div>
                  </div>
                  
                  {/* Color Selector */}
                  {product.colors && product.colors.length > 1 && (
                    <div className="flex flex-col gap-y-[12px] md:mt-[24px] w-full md:w-auto">
                      <div className="flex gap-x-[6px] sm:gap-x-[8px] overflow-x-auto pb-2 scrollbar-hide md:overflow-x-visible md:justify-center">
                        {product.colors.map((color) => {
                          const colorMap: Record<string, string> = {
                            'Black': '#000000',
                            'White': '#F7F7F5',
                            'Cream': '#D5CCBF',
                            'Grey': '#8F9AA6',
                            'Gray': '#8F9AA6',
                            'Navy': '#4A5568',
                            'Pink': '#FFC0CB',
                            'Purple': '#9F7AEA',
                            'Maroon': '#800000',
                            'Blue': '#74CADC',
                            'Royal Blue': '#4169E1',
                            'Green': '#68D391',
                            'Red': '#F56565',
                          };
                          const colorValue = colorMap[color] ?? '#CCCCCC';
                          const isSelected = selectedColor === color;
                          
                          return (
                            <div key={color} className="flex flex-col items-center gap-y-[6px] flex-shrink-0">
                              <button
                                onClick={() => {
                                  setSelectedColor(color);
                                  setCustomColorValue("");
                                }}
                                className={`w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] md:w-[40px] md:h-[40px] rounded-full flex items-center justify-center transition-all active:scale-95 touch-manipulation border-2 ${
                                  isSelected 
                                    ? 'border-[#74CADC]' 
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                                style={{ backgroundColor: colorValue }}
                                aria-label={`${product.name.toLowerCase()}-${color.toLowerCase()}-color-selector`}
                              >
                                {isSelected && (
                                  <span className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] md:w-[12px] md:h-[12px] block rounded-full bg-white"></span>
                                )}
                              </button>
                              <span className={`text-[11px] sm:text-[12px] leading-[130%] whitespace-nowrap transition-colors ${
                                isSelected ? 'text-black/[0.72] font-medium' : 'text-black/[0.72]'
                              }`}>{color}</span>
                            </div>
                          );
                        })}
                        {/* Custom Color Option for Keepsake Sweater */}
                        {product.requiresBabyClothes && (
                          <div className="flex flex-col items-center gap-y-[6px] flex-shrink-0">
                            <button
                              onClick={() => setSelectedColor("Custom")}
                              className={`w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] md:w-[40px] md:h-[40px] rounded-full flex items-center justify-center transition-all active:scale-95 touch-manipulation border-2 ${
                                selectedColor === "Custom" 
                                  ? 'border-[#74CADC] bg-[#74CADC]' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: selectedColor === "Custom" ? '#74CADC' : "transparent" }}
                              aria-label="custom-color-selector"
                            >
                              <span className="text-[18px]">🎨</span>
                            </button>
                            <span className={`text-[11px] sm:text-[12px] leading-[130%] whitespace-nowrap transition-colors ${
                              selectedColor === "Custom" ? 'text-black/[0.72] font-medium' : 'text-black/[0.72]'
                            }`}>Custom</span>
                          </div>
                        )}
                      </div>
                      {/* Custom Color Input */}
                      {selectedColor === "Custom" && product.requiresBabyClothes && (
                        <div className="mt-2 w-full">
                          <input
                            type="text"
                            value={customColorValue}
                            onChange={(e) => setCustomColorValue(e.target.value)}
                            placeholder="Enter your custom color"
                            className="w-full px-3 py-2 text-[13px] sm:text-[14px] border border-gray-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tab Content */}
                {activeTab === 'product' ? (
                  <>
                    {/* Size Selection as Plan Options - NEO Style */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="bg-black/[0.06] rounded-[20px] sm:rounded-[24px] p-[4px] mt-[20px] sm:mt-[24px]">
                        {product.sizes.map((size) => {
                          const isSelected = selectedSize === size;
                          const sizePrice = size === 'XXL' ? product.price + 3 : size === '3XL' ? product.price + 5 : product.price;
                          
                          return (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className="p-[14px] sm:p-[16px] relative block w-full active:opacity-80 touch-manipulation"
                            >
                              <div className={`flex justify-between relative z-[2] transition-colors ${
                                isSelected ? 'text-[#0A5565]' : 'text-black/[0.72]'
                              }`}>
                                <h2 className={`text-[13px] sm:text-[14px] leading-[130%] font-bold ${isSelected ? 'text-[#0A5565]' : 'text-black/[0.72]'}`}>{size}</h2>
                                <h3 className={`text-[13px] sm:text-[14px] leading-[130%] font-bold ${isSelected ? 'text-[#0A5565]' : 'text-black/[0.72]'}`}>
                                  ${sizePrice.toFixed(2)}
                                </h3>
                              </div>
                              {isSelected && (
                                <div 
                                  className="w-full h-full absolute rounded-[18px] sm:rounded-[20px] bg-[#74CADC] top-0 left-0" 
                                  style={{ opacity: 1 }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Description */}
                    <div className="mt-5 sm:mt-6">
                      <p className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] text-black/[0.72]">{product.description}</p>
                    </div>

                    {/* Special Instructions */}
                    {product.requiresBabyClothes && (
                      <div className="mt-5 sm:mt-6 bg-[#FFF4E6] border border-[#FF8C00] rounded-[20px] sm:rounded-[24px] p-3 sm:p-4">
                        <p className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] font-bold text-[#CC6600] mb-1">
                          Don&apos;t forget to bring your baby clothes!
                        </p>
                        <p className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] text-[#B35900]">
                          Please bring your baby clothes within {product.babyClothesDeadlineDays ?? 5} days of placing your order.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  /* FAQ Tab Content */
                  <div className="mt-[20px] sm:mt-[24px]">
                    <div className="flex flex-col gap-y-[12px] sm:gap-y-[16px]" data-orientation="vertical">
                      <div className="bg-black/[0.03] rounded-[20px] sm:rounded-[24px] p-[20px] sm:p-[24px]">
                        <h3 className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] font-bold mb-2">
                          How long does customization take?
                        </h3>
                        <p className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] text-black/[0.44]">
                          Most custom orders are completed within 5-7 business days. Rush orders may be available upon request.
                        </p>
                      </div>
                      <div className="bg-black/[0.03] rounded-[20px] sm:rounded-[24px] p-[20px] sm:p-[24px]">
                        <h3 className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] font-bold mb-2">
                          What payment methods do you accept?
                        </h3>
                        <p className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] text-black/[0.44]">
                          We accept all major credit cards and debit cards through our secure checkout system.
                        </p>
                      </div>
                      <div className="bg-black/[0.03] rounded-[20px] sm:rounded-[24px] p-[20px] sm:p-[24px]">
                        <h3 className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] font-bold mb-2">
                          Do you offer refunds?
                        </h3>
                        <p className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] text-black/[0.44]">
                          Custom items are non-refundable, but we&apos;re happy to work with you on any issues.
                        </p>
                      </div>
                      {product.requiresBabyClothes && (
                        <div className="bg-black/[0.03] rounded-[20px] sm:rounded-[24px] p-[20px] sm:p-[24px]">
                          <h3 className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] font-bold mb-2">
                            What happens if I don&apos;t bring baby clothes?
                          </h3>
                          <p className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] text-black/[0.44]">
                            You must bring baby clothes within {product.babyClothesDeadlineDays ?? 5} days. 
                            If not received, we&apos;ll contact you about alternatives.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* Order Section - NEO Style */}
              <section className="mt-[20px] sm:mt-[24px] md:mt-[24px]">
                <div className="flex flex-col items-center" style={{ opacity: 1 }}>
                  <h3 className="text-[15px] sm:text-[16px] leading-[130%] font-bold text-center text-black/[0.72]">
                    ${displayPrice.toFixed(2)}
                  </h3>
                  {product.requiresBabyClothes && (
                    <h3 className="text-[12px] sm:text-[14px] leading-[130%] text-center text-black/[0.72] opacity-50 font-normal mt-1">
                      Please bring baby clothes within {product.babyClothesDeadlineDays ?? 5} days
                    </h3>
                  )}
                  {!product.inStock && (
                    <h3 className="text-[12px] sm:text-[14px] leading-[130%] text-center text-black/[0.72] opacity-50 font-normal mt-1">
                      Out of Stock
                    </h3>
                  )}
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 active:bg-[#74CADC]/80 text-[#0A5565] py-[13px] sm:py-[14px] mt-[20px] sm:mt-[24px] text-[13px] sm:text-[14px] leading-[130%] font-medium touch-manipulation transition-all active:scale-[0.98]"
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
        </div>
      </Container>
      <div className="h-[16px] md:h-[12px] lg:h-[16px]"></div>
    </main>
  );
}