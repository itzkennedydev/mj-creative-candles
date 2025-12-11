"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Check,
  ShoppingBag,
  Shield,
  Truck,
  Clock,
} from "lucide-react";
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
      const errorData = (await response.json()) as { error?: string };
      throw new Error(
        errorData.error ?? `Failed to fetch product: ${response.status}`,
      );
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

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => {
      if (!productId) {
        throw new Error("Product ID is required");
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
      const price =
        product.salePrice ?? product.price ?? product.regularPrice ?? 0;
      trackViewItem(product.id ?? "", product.name, price);
    }
  }, [product]);

  // Get all images
  const getImageUrl = (imageId: string, dataUri: string) => {
    if (dataUri.startsWith("data:") && imageId && imageId.length > 10) {
      return getOptimizedImageUrl(imageId, dataUri, 1200);
    }
    return dataUri;
  };

  const allImages = useMemo(() => {
    if (!product) return [];
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
  }, [product]);

  // Map colors to image indices
  const getImageIndexForColor = useCallback(
    (color: string): number | null => {
      if (!product?.colors || product.colors.length <= 1 || !allImages.length)
        return null;

      const colorLower = color.toLowerCase();

      for (let i = 0; i < allImages.length; i++) {
        const imageSrc = allImages[i]?.src ?? "";
        const imageSrcLower = imageSrc.toLowerCase();

        // Beanie-specific color mappings - require SPECIFIC color word in filename
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
    [allImages, product?.colors],
  );

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
    if (
      selectedColor &&
      product?.colors &&
      product.colors.length > 1 &&
      allImages.length > 0
    ) {
      const imageIndex = getImageIndexForColor(selectedColor);
      if (
        imageIndex !== null &&
        imageIndex >= 0 &&
        imageIndex < allImages.length
      ) {
        setCurrentImageIndex(imageIndex);
      }
    }
  }, [selectedColor, getImageIndexForColor, allImages.length, product?.colors]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 1 && !selectedSize) {
      addToast({
        title: "Size Required",
        description: "Please select a size before adding to cart.",
        type: "warning",
      });
      return;
    }
    if (product.colors && product.colors.length > 1 && !selectedColor) {
      addToast({
        title: "Color Required",
        description: "Please select a color before adding to cart.",
        type: "warning",
      });
      return;
    }
    if (selectedColor === "Custom" && !customColorValue.trim()) {
      addToast({
        title: "Custom Color Required",
        description: "Please specify your custom color.",
        type: "warning",
      });
      return;
    }

    // Add micro-interaction feedback (Doherty Threshold - keep under 400ms)
    setIsAddingToCart(true);

    const isBeanie = product.name.toLowerCase() === "beanie";
    addItem(
      product,
      quantity,
      selectedSize,
      selectedColor,
      selectedColor === "Custom" ? customColorValue : undefined,
      isBeanie ? embroideryName : undefined,
      orderNotes || undefined, // Notes available for all products
    );

    // Brief delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 300));

    setIsAddingToCart(false);
    addToast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      type: "success",
    });
  };

  const basePrice = product
    ? (product.salePrice ?? product.price ?? product.regularPrice ?? 0)
    : 0;
  const displayPrice =
    basePrice + (selectedSize === "XXL" ? 3 : selectedSize === "3XL" ? 5 : 0);

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
      setCurrentImageIndex((prev) =>
        prev < allImages.length - 1 ? prev + 1 : 0,
      );
    } else if (distance < -minSwipeDistance && allImages.length > 1) {
      setCurrentImageIndex((prev) =>
        prev > 0 ? prev - 1 : allImages.length - 1,
      );
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
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);

  // Loading state with skeleton (reduces perceived wait time)
  if (isLoading) {
    return (
      <main className="min-h-screen bg-white pb-8 pt-6">
        <Container>
          <div className="gap-8 md:grid md:grid-cols-2 lg:gap-12">
            {/* Image Skeleton */}
            <div className="aspect-square animate-pulse rounded-3xl bg-gray-100" />
            {/* Content Skeleton */}
            <div className="space-y-6 pt-6">
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-6 w-1/4 animate-pulse rounded-lg bg-gray-100" />
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-14 animate-pulse rounded-2xl bg-gray-100" />
            </div>
          </div>
        </Container>
      </main>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Product Not Found
          </h2>
          <p className="mb-6 text-gray-600">
            {error instanceof Error
              ? error.message
              : "We couldn't find the product you're looking for."}
          </p>
          <Link href="/shop">
            <Button className="rounded-full bg-[#1d1d1f] px-8 py-3 text-base font-medium text-white hover:bg-[#0a0a0a]">
              Browse All Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isBeanie = product.name.toLowerCase() === "beanie";

  return (
    <main className="min-h-screen bg-white">
      <Container>
        {/* Breadcrumb - Jakob's Law (familiar navigation) */}
        <nav className="py-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-gray-500">
            <li>
              <Link
                href="/shop"
                className="transition-colors hover:text-gray-900"
              >
                Shop
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4" />
            </li>
            <li className="truncate font-medium text-gray-900">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="pb-8 md:pb-12 lg:pb-16">
          <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12 xl:gap-16">
            {/* Left Panel - Product Images (Law of Common Region - contained in clear boundary) */}
            <section
              ref={imageContainerRef}
              className="relative aspect-[4/5] touch-pan-y overflow-hidden rounded-2xl sm:aspect-square md:sticky md:top-24 md:aspect-auto md:h-[720px] md:rounded-3xl lg:h-[850px] xl:h-[88vh] xl:max-h-[950px]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                ref={imageRef}
                className="group relative h-full w-full cursor-zoom-in overflow-hidden rounded-2xl border border-gray-200 bg-[#F5F5F3] md:cursor-crosshair md:rounded-3xl"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {allImages.length > 0 && (
                  <>
                    <Image
                      src={
                        allImages[currentImageIndex]?.src ?? "/placeholder.jpg"
                      }
                      alt={product.name}
                      fill
                      className={`object-cover object-top transition-transform duration-300 ${isZoomed ? "md:scale-150" : ""}`}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      style={{
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                    />

                    {/* Zoom hint */}
                    {!isZoomed && (
                      <div className="pointer-events-none absolute bottom-20 left-1/2 hidden -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 md:block">
                        Hover to zoom
                      </div>
                    )}
                  </>
                )}

                {/* Sale Badge - Von Restorff Effect (stands out) */}
                {new Date() < new Date("2025-12-02T05:59:59Z") && (
                  <div className="absolute left-4 top-4 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-3 py-1.5 text-xs font-semibold text-white">
                      🎉 15% OFF — Code: STITCHIT
                    </span>
                  </div>
                )}

                {/* Navigation Arrows - Fitts's Law (large touch targets) */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex > 0
                            ? currentImageIndex - 1
                            : allImages.length - 1,
                        )
                      }
                      className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-3 text-gray-900 transition-colors hover:bg-gray-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex < allImages.length - 1
                            ? currentImageIndex + 1
                            : 0,
                        )
                      }
                      className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-3 text-gray-900 transition-colors hover:bg-gray-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Dots - Miller's Law (limited indicators) */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          currentImageIndex === idx
                            ? "w-6 bg-white"
                            : "bg-white/50 hover:bg-white/70"
                        }`}
                        aria-label={`View image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Expand Button */}
                <button
                  onClick={() => setIsExpanded(true)}
                  className="absolute right-4 top-4 z-10 rounded-full border border-gray-200 bg-white p-2.5 text-gray-900 transition-colors hover:bg-gray-100"
                  aria-label="Expand image"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>

              {/* Thumbnail Strip - Chunking (grouped images) */}
              {allImages.length > 1 && (
                <div className="mt-4 hidden gap-2 overflow-x-auto pb-2 md:flex">
                  {allImages.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        currentImageIndex === idx
                          ? "border-[#1d1d1f] ring-2 ring-[#1d1d1f]/20"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={img.src}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Expanded Image Modal */}
            {isExpanded && allImages.length > 0 && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
                onClick={() => setIsExpanded(false)}
              >
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute right-4 top-4 z-50 rounded-full bg-white p-3 text-black transition-colors hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>

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
                      className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white p-4 text-black transition-colors hover:bg-gray-100"
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
                      className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white p-4 text-black transition-colors hover:bg-gray-100"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                <div
                  className="relative h-full max-h-[85vh] w-full max-w-5xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={
                      allImages[currentImageIndex]?.src ?? "/placeholder.jpg"
                    }
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
                  <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                    {product.name}
                  </h1>

                  {/* Price - Von Restorff Effect (prominent) */}
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      ${displayPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Trust Indicators - Law of Uniform Connectedness */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-[#1d1d1f]" />
                      <span>Local Pickup</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#1d1d1f]" />
                      <span>5-7 Day Turnaround</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-[#1d1d1f]" />
                      <span>Quality Guaranteed</span>
                    </div>
                  </div>
                </header>

                {/* Promo Alert - Von Restorff Effect */}
                {new Date() < new Date("2025-12-02T05:59:59Z") && (
                  <div className="rounded-2xl bg-[#1d1d1f] p-4 text-white">
                    <p className="flex items-center gap-2 font-semibold">
                      🎉 15% Off Sale — Ends Tonight!
                    </p>
                    <p className="mt-1 text-sm text-white/90">
                      Use code{" "}
                      <span className="rounded bg-white/10 px-2 py-0.5 font-bold">
                        STITCHIT
                      </span>{" "}
                      at checkout. Hurry, offer expires Dec 1st at 11:59 PM!
                    </p>
                  </div>
                )}

                {/* Description - Cognitive Load (concise info) */}
                <p className="leading-relaxed text-gray-600">
                  {product.description}
                </p>

                {/* Color Selection - Law of Similarity (grouped options) */}
                {product.colors && product.colors.length > 1 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Color:{" "}
                      <span className="font-normal text-gray-600">
                        {selectedColor}
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => {
                        const colorMap: Record<string, string> = {
                          Black: "#000000",
                          White: "#F7F7F5",
                          Cream: "#D5CCBF",
                          Grey: "#8F9AA6",
                          Gray: "#8F9AA6",
                          "Icon Grey": "#8F9AA6",
                          Navy: "#1E3A5F",
                          Pink: "#FFC0CB",
                          "Pink Raspberry": "#E91E63",
                          Purple: "#9F7AEA",
                          "Purple & Black": "#6B46C1",
                          Maroon: "#800000",
                          "Maroon & Black": "#722F37",
                          Blue: "#3B82F6",
                          "Royal Blue": "#4169E1",
                          "True Royal": "#0066CC",
                          Red: "#DC2626",
                          "Red & Royal": "#DC143C",
                          "Red & Black": "#8B0000",
                          Green: "#22C55E",
                          "Forest Green": "#228B22",
                          Gold: "#FFD700",
                          "Gold & White": "#FFD700",
                          Orange: "#F97316",
                          Yellow: "#EAB308",
                          Teal: "#14B8A6",
                          Brown: "#92400E",
                          Moline: "#1E3A5F",
                        };
                        const colorValue = colorMap[color] ?? "#CCCCCC";
                        const isSelected = selectedColor === color;
                        const isMultiColor = color.includes("&");

                        const getColorStyle = () => {
                          if (isMultiColor) {
                            if (
                              color.includes("Gold") &&
                              color.includes("White")
                            )
                              return {
                                background:
                                  "linear-gradient(135deg, #FFD700 50%, #F7F7F5 50%)",
                              };
                            if (
                              color.includes("Red") &&
                              color.includes("Black")
                            )
                              return {
                                background:
                                  "linear-gradient(135deg, #DC143C 50%, #000000 50%)",
                              };
                            if (
                              color.includes("Red") &&
                              color.includes("Royal")
                            )
                              return {
                                background:
                                  "linear-gradient(135deg, #DC143C 50%, #4169E1 50%)",
                              };
                            if (
                              color.includes("Purple") &&
                              color.includes("Black")
                            )
                              return {
                                background:
                                  "linear-gradient(135deg, #9F7AEA 50%, #000000 50%)",
                              };
                            if (
                              color.includes("Maroon") &&
                              color.includes("Black")
                            )
                              return {
                                background:
                                  "linear-gradient(135deg, #800000 50%, #000000 50%)",
                              };
                          }
                          return { backgroundColor: colorValue };
                        };

                        return (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedColor(color);
                              setCustomColorValue("");
                            }}
                            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                              isSelected
                                ? "border-[#1d1d1f] ring-2 ring-[#1d1d1f] ring-offset-2"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                            style={getColorStyle()}
                            title={color}
                          >
                            {isSelected && (
                              <Check className="h-5 w-5 text-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {selectedColor === "Custom" && (
                      <input
                        type="text"
                        value={customColorValue}
                        onChange={(e) => setCustomColorValue(e.target.value)}
                        placeholder="Enter your custom color"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]"
                      />
                    )}
                  </div>
                )}

                {/* Size Selection - Hick's Law (clear options reduce decision time) */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Size:{" "}
                      <span className="font-normal text-gray-600">
                        {selectedSize}
                      </span>
                    </label>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {product.sizes.map((size) => {
                        const isSelected = selectedSize === size;

                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`relative rounded-xl px-2 py-3 text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-[#1d1d1f] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Personalization Section - Available for all products */}
                <div className="space-y-4 rounded-2xl bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900">
                    Personalization (Optional)
                  </h3>

                  {/* Embroidery Name - Only for Beanie */}
                  {isBeanie && (
                    <div>
                      <label className="mb-2 block text-sm text-gray-600">
                        Embroidery Name
                      </label>
                      <input
                        type="text"
                        value={embroideryName}
                        onChange={(e) => setEmbroideryName(e.target.value)}
                        placeholder="Enter name for embroidery"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]"
                      />
                    </div>
                  )}

                  {/* Order Notes - Available for all products */}
                  <div>
                    <label className="mb-2 block text-sm text-gray-600">
                      Order Notes
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={2}
                      placeholder="Any special requests, color preferences, or instructions..."
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]"
                    />
                  </div>
                </div>

                {/* Delivery Timeframe - Subtle */}
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  5-7 business days (may vary if materials need to be ordered)
                </p>

                {/* CTA Section - Fitts's Law (large button), Peak-End Rule (satisfying action) */}
                <div className="space-y-4 pt-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.inStock || isAddingToCart}
                    className={`w-full rounded-2xl py-6 text-lg font-semibold transition-colors ${
                      product.inStock
                        ? "bg-[#1d1d1f] text-white hover:bg-[#0a0a0a]"
                        : "cursor-not-allowed bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isAddingToCart ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Adding...
                      </span>
                    ) : product.inStock ? (
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Add to Cart — ${displayPrice.toFixed(2)}
                      </span>
                    ) : (
                      "Out of Stock"
                    )}
                  </Button>

                  {/* Trust Badge */}
                  <p className="text-center text-sm text-gray-500">
                    <Shield className="mr-1 inline h-4 w-4" />
                    Secure checkout · Quality guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Mobile Sticky CTA - Goal-Gradient Effect (always visible progress toward purchase) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-4 md:hidden">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAddingToCart}
          className={`w-full rounded-xl py-4 text-base font-semibold ${
            product.inStock
              ? "bg-[#1d1d1f] text-white hover:bg-[#0a0a0a]"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {isAddingToCart
            ? "Adding..."
            : product.inStock
              ? `Add to Cart — $${displayPrice.toFixed(2)}`
              : "Out of Stock"}
        </Button>
      </div>

      {/* Spacer for mobile sticky CTA */}
      <div className="h-20 md:hidden" />
    </main>
  );
}
