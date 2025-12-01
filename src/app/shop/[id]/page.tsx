"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Maximize2, X, Check, ShoppingBag, Shield, Truck, Clock } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [embroideryName, setEmbroideryName] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const imageRef = useRef<HTMLDivElement>(null);

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
    staleTime: 10 * 60 * 1000, // 10 min fresh
    gcTime: 60 * 60 * 1000, // 1 hour cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    placeholderData: (prev) => prev, // Show stale data immediately
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

  // Map colors to image indices
  const getImageIndexForColor = useCallback((color: string): number | null => {
    if (!product?.colors || product.colors.length <= 1 || !allImages.length) return null;
    
    const colorLower = color.toLowerCase();
    
    for (let i = 0; i < allImages.length; i++) {
      const imageSrc = allImages[i]?.src ?? '';
      const imageSrcLower = imageSrc.toLowerCase();
      
      // Beanie-specific color mappings
      if (colorLower.includes('forest green') && (imageSrcLower.includes('forest green') || imageSrcLower.includes('forestgreen'))) return i;
      if (colorLower.includes('gold') && colorLower.includes('white') && (imageSrcLower.includes('gold') || imageSrcLower.includes('white'))) return i;
      if (colorLower.includes('icon grey') && imageSrcLower.includes('icon grey')) return i;
      if (colorLower.includes('maroon') && colorLower.includes('black') && (imageSrcLower.includes('maroon') || imageSrcLower.includes('black'))) return i;
      if (colorLower.includes('pink raspberry') && (imageSrcLower.includes('pink') || imageSrcLower.includes('raspberry'))) return i;
      if (colorLower.includes('purple') && colorLower.includes('black') && (imageSrcLower.includes('purple') || imageSrcLower.includes('black'))) return i;
      if (colorLower.includes('red') && colorLower.includes('black') && !colorLower.includes('royal') && (imageSrcLower.includes('red') && imageSrcLower.includes('black'))) return i;
      if (colorLower.includes('red') && colorLower.includes('royal') && (imageSrcLower.includes('red') && imageSrcLower.includes('royal'))) return i;
      if (colorLower.includes('true royal') && (imageSrcLower.includes('true royal') || imageSrcLower.includes('trueroyal'))) return i;
      if (colorLower.includes('black on black') && (imageSrcLower.includes('blackonblack') || imageSrcLower.includes('black-on-black'))) return i;
      if (colorLower.includes('moline black') && (imageSrcLower.includes('molineblack') || imageSrcLower.includes('moline-black'))) return i;
      if (colorLower.includes('royal blue') && imageSrcLower.includes('blue')) return i;
      if (colorLower.includes('black') && imageSrcLower.includes('black') && !imageSrcLower.includes('molineblack') && !imageSrcLower.includes('blackonblack')) return i;
      if (colorLower.includes('blue') && imageSrcLower.includes('blue')) return i;
      if (colorLower.includes('white') && imageSrcLower.includes('white')) return i;
      if (colorLower.includes('red') && imageSrcLower.includes('red')) return i;
      if (colorLower === 'moline' && (imageSrcLower.includes('beanie') && !imageSrcLower.includes('black'))) return i;
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
  }, [selectedColor, getImageIndexForColor, allImages.length, product?.colors]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (product.sizes && product.sizes.length > 1 && !selectedSize) {
      addToast({ title: "Size Required", description: "Please select a size before adding to cart.", type: "warning" });
      return;
    }
    if (product.colors && product.colors.length > 1 && !selectedColor) {
      addToast({ title: "Color Required", description: "Please select a color before adding to cart.", type: "warning" });
      return;
    }
    if (selectedColor === "Custom" && !customColorValue.trim()) {
      addToast({ title: "Custom Color Required", description: "Please specify your custom color.", type: "warning" });
      return;
    }
    
    // Add micro-interaction feedback (Doherty Threshold - keep under 400ms)
    setIsAddingToCart(true);
    
    const isBeanie = product.name.toLowerCase() === 'beanie';
    addItem(
      product, 
      quantity, 
      selectedSize, 
      selectedColor, 
      selectedColor === "Custom" ? customColorValue : undefined,
      isBeanie ? embroideryName : undefined,
      isBeanie ? orderNotes : undefined
    );
    
    // Brief delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsAddingToCart(false);
    addToast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      type: "success"
    });
  };

  const displayPrice = product ? product.price + (selectedSize === 'XXL' ? 3 : selectedSize === '3XL' ? 5 : 0) : 0;

  // Handle swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    } else if (distance < -minSwipeDistance && allImages.length > 1) {
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
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);

  // Loading state with skeleton (reduces perceived wait time)
  if (isLoading) {
    return (
      <main className="bg-white min-h-screen pt-6 pb-8">
        <Container>
          <div className="md:grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Skeleton */}
            <div className="aspect-square rounded-3xl bg-gray-100 animate-pulse" />
            {/* Content Skeleton */}
            <div className="pt-6 space-y-6">
              <div className="h-10 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-100 rounded-lg w-1/4 animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
              </div>
              <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        </Container>
      </main>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : "We couldn't find the product you're looking for."}
          </p>
          <Link href="/shop">
            <Button className="bg-[#0A5565] hover:bg-[#083d4a] text-white px-8 py-3 text-base font-medium rounded-full">
              Browse All Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isBeanie = product.name.toLowerCase() === 'beanie';

  return (
    <main className="bg-white min-h-screen">
      <Container>
        {/* Breadcrumb - Jakob's Law (familiar navigation) */}
        <nav className="py-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-gray-500">
            <li><Link href="/shop" className="hover:text-gray-900 transition-colors">Shop</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li className="text-gray-900 font-medium truncate">{product.name}</li>
          </ol>
        </nav>

        <div className="pb-8 md:pb-12 lg:pb-16">
          <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12 xl:gap-16">
            
            {/* Left Panel - Product Images (Law of Common Region - contained in clear boundary) */}
            <section 
              ref={imageContainerRef}
              className="relative aspect-[3/4] sm:aspect-[4/5] md:aspect-auto md:h-[720px] lg:h-[850px] xl:h-[88vh] xl:max-h-[950px] rounded-2xl md:rounded-3xl overflow-hidden md:sticky md:top-24 touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                ref={imageRef}
                className="relative bg-[#F5F5F3] w-full h-full cursor-zoom-in md:cursor-crosshair group border border-gray-200 rounded-2xl md:rounded-3xl overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {allImages.length > 0 && (
                  <>
                    <Image
                      src={allImages[currentImageIndex]?.src ?? '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className={`object-cover object-top transition-transform duration-300 ${isZoomed ? 'md:scale-150' : ''}`}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      style={{ transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }}
                    />
                    
                    {/* Zoom hint */}
                    {!isZoomed && (
                      <div className="hidden md:block absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Hover to zoom
                      </div>
                    )}
                  </>
                )}
                
                {/* Sale Badge - Von Restorff Effect (stands out) */}
                {isBeanie && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 bg-[#0A5565] text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                      🎉 15% OFF
                    </span>
                  </div>
                )}

                {/* Navigation Arrows - Fitts's Law (large touch targets) */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-900 p-3 rounded-full border border-gray-200 transition-colors z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-900 p-3 rounded-full border border-gray-200 transition-colors z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Dots - Miller's Law (limited indicators) */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentImageIndex === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`View image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Expand Button */}
                <button
                  onClick={() => setIsExpanded(true)}
                  className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-gray-900 p-2.5 rounded-full border border-gray-200 transition-colors z-10"
                  aria-label="Expand image"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>

              {/* Thumbnail Strip - Chunking (grouped images) */}
              {allImages.length > 1 && (
                <div className="hidden md:flex gap-2 mt-4 overflow-x-auto pb-2">
                  {allImages.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        currentImageIndex === idx ? 'border-[#0A5565] ring-2 ring-[#0A5565]/20' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image src={img.src} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Expanded Image Modal */}
            {isExpanded && allImages.length > 0 && (
              <div 
                className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
                onClick={() => setIsExpanded(false)}
              >
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-4 right-4 bg-white text-black p-3 rounded-full z-50 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
                
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white text-black p-4 rounded-full z-50 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-black p-4 rounded-full z-50 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                <div className="relative w-full h-full max-w-5xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                  <Image
                    src={allImages[currentImageIndex]?.src ?? '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Right Panel - Product Details (Chunking - organized sections) */}
            <div className="pt-6 md:pt-0">
              <div className="space-y-6">
                
                {/* Header Section - Serial Position Effect (important info first) */}
                <header>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  
                  {/* Price - Von Restorff Effect (prominent) */}
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
                    {isBeanie && (
                      <span className="text-lg text-gray-400 line-through">${(displayPrice / 0.85).toFixed(2)}</span>
                    )}
                  </div>

                  {/* Trust Indicators - Law of Uniform Connectedness */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#0A5565]" />
                      <span>Local Pickup</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#0A5565]" />
                      <span>5-7 Day Turnaround</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#0A5565]" />
                      <span>Quality Guaranteed</span>
                    </div>
                  </div>
                </header>

                {/* Promo Alert - Von Restorff Effect */}
                {isBeanie && (
                  <div className="bg-[#0A5565] text-white rounded-2xl p-4">
                    <p className="font-semibold flex items-center gap-2">
                      🎉 Cyber Monday Sale!
                    </p>
                    <p className="text-white/90 text-sm mt-1">
                      Use code <span className="font-bold bg-white/10 px-2 py-0.5 rounded">STITCHIT</span> for 15% off at checkout.
                    </p>
                  </div>
                )}

                {/* Description - Cognitive Load (concise info) */}
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Color Selection - Law of Similarity (grouped options) */}
                {product.colors && product.colors.length > 1 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Color: <span className="font-normal text-gray-600">{selectedColor}</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => {
                        const colorMap: Record<string, string> = {
                          'Black': '#000000',
                          'White': '#F7F7F5',
                          'Cream': '#D5CCBF',
                          'Grey': '#8F9AA6',
                          'Gray': '#8F9AA6',
                          'Icon Grey': '#8F9AA6',
                          'Navy': '#1E3A5F',
                          'Pink': '#FFC0CB',
                          'Pink Raspberry': '#E91E63',
                          'Purple': '#9F7AEA',
                          'Purple & Black': '#6B46C1',
                          'Maroon': '#800000',
                          'Maroon & Black': '#722F37',
                          'Blue': '#3B82F6',
                          'Royal Blue': '#4169E1',
                          'True Royal': '#0066CC',
                          'Red': '#DC2626',
                          'Red & Royal': '#DC143C',
                          'Red & Black': '#8B0000',
                          'Green': '#22C55E',
                          'Forest Green': '#228B22',
                          'Gold': '#FFD700',
                          'Gold & White': '#FFD700',
                          'Orange': '#F97316',
                          'Yellow': '#EAB308',
                          'Teal': '#14B8A6',
                          'Brown': '#92400E',
                          'Moline': '#1E3A5F',
                        };
                        const colorValue = colorMap[color] ?? '#CCCCCC';
                        const isSelected = selectedColor === color;
                        const isMultiColor = color.includes('&');
                        
                        const getColorStyle = () => {
                          if (isMultiColor) {
                            if (color.includes('Gold') && color.includes('White')) return { background: 'linear-gradient(135deg, #FFD700 50%, #F7F7F5 50%)' };
                            if (color.includes('Red') && color.includes('Black')) return { background: 'linear-gradient(135deg, #DC143C 50%, #000000 50%)' };
                            if (color.includes('Red') && color.includes('Royal')) return { background: 'linear-gradient(135deg, #DC143C 50%, #4169E1 50%)' };
                            if (color.includes('Purple') && color.includes('Black')) return { background: 'linear-gradient(135deg, #9F7AEA 50%, #000000 50%)' };
                            if (color.includes('Maroon') && color.includes('Black')) return { background: 'linear-gradient(135deg, #800000 50%, #000000 50%)' };
                          }
                          return { backgroundColor: colorValue };
                        };
                        
                        return (
                          <button
                            key={color}
                            onClick={() => { setSelectedColor(color); setCustomColorValue(""); }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 ${
                              isSelected ? 'border-[#0A5565] ring-2 ring-[#0A5565] ring-offset-2' : 'border-gray-200 hover:border-gray-400'
                            }`}
                            style={getColorStyle()}
                            title={color}
                          >
                            {isSelected && <Check className="w-5 h-5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                    {selectedColor === "Custom" && product.requiresBabyClothes && (
                      <input
                        type="text"
                        value={customColorValue}
                        onChange={(e) => setCustomColorValue(e.target.value)}
                        placeholder="Enter your custom color"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A5565] focus:border-transparent"
                      />
                    )}
                  </div>
                )}

                {/* Size Selection - Hick's Law (clear options reduce decision time) */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Size: <span className="font-normal text-gray-600">{selectedSize}</span>
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {product.sizes.map((size) => {
                        const isSelected = selectedSize === size;
                        
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`relative py-3 px-2 rounded-xl text-sm font-medium transition-colors ${
                              isSelected 
                                ? 'bg-[#0A5565] text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Personalization for Beanie - Progressive Disclosure */}
                {isBeanie && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-2xl">
                    <h3 className="font-semibold text-gray-900">Personalization (Optional)</h3>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Embroidery Name</label>
                      <input
                        type="text"
                        value={embroideryName}
                        onChange={(e) => setEmbroideryName(e.target.value)}
                        placeholder="Enter name for embroidery"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A5565] focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Special Instructions</label>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        rows={2}
                        placeholder="Any special requests..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A5565] focus:border-transparent bg-white resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Baby Clothes Reminder */}
                {product.requiresBabyClothes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="font-semibold text-amber-800 flex items-center gap-2">
                      <span>👶</span> Don&apos;t forget your baby clothes!
                    </p>
                    <p className="text-amber-700 text-sm mt-1">
                      Please bring your baby clothes within {product.babyClothesDeadlineDays ?? 5} days of placing your order.
                    </p>
                  </div>
                )}

                {/* CTA Section - Fitts's Law (large button), Peak-End Rule (satisfying action) */}
                <div className="space-y-4 pt-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.inStock || isAddingToCart}
                    className={`w-full py-6 text-lg font-semibold rounded-2xl transition-colors ${
                      product.inStock 
                        ? 'bg-[#0A5565] hover:bg-[#083d4a] text-white' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isAddingToCart ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding...
                      </span>
                    ) : product.inStock ? (
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Add to Cart — ${displayPrice.toFixed(2)}
                      </span>
                    ) : (
                      'Out of Stock'
                    )}
                  </Button>

                  {/* Trust Badge */}
                  <p className="text-center text-sm text-gray-500">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Secure checkout · Quality guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Mobile Sticky CTA - Goal-Gradient Effect (always visible progress toward purchase) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:hidden z-40">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAddingToCart}
          className={`w-full py-4 text-base font-semibold rounded-xl ${
            product.inStock 
              ? 'bg-[#0A5565] hover:bg-[#083d4a] text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {isAddingToCart ? 'Adding...' : product.inStock ? `Add to Cart — $${displayPrice.toFixed(2)}` : 'Out of Stock'}
        </Button>
      </div>
      
      {/* Spacer for mobile sticky CTA */}
      <div className="h-20 md:hidden" />
    </main>
  );
}
