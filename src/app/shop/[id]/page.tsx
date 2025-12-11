"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ShoppingBag,
  Shield,
  Truck,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { useCart } from "~/lib/cart-context";
import { useToast } from "~/lib/toast-context";
import { useQuery } from "@tanstack/react-query";
import type { Product, Review } from "~/lib/types";
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

async function fetchReviews(productId: string): Promise<Review[]> {
  const response = await fetch(`/api/reviews/${productId}`);
  if (!response.ok) return [];
  return response.json() as Promise<Review[]>;
}

async function fetchRecommendedProducts(productId: string): Promise<Product[]> {
  const response = await fetch(`/api/products/${productId}/recommended`);
  if (!response.ok) return [];
  return response.json() as Promise<Product[]>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const quantity = 1;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
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
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    placeholderData: (prev) => prev,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchReviews(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: recommendedProducts = [] } = useQuery({
    queryKey: ["recommendedProducts", productId],
    queryFn: () => fetchRecommendedProducts(productId),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
  });

  // Track product view analytics
  useEffect(() => {
    if (product) {
      trackViewItem(product.id ?? "", product.name, product.price);
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

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    addItem(product, quantity, orderNotes || undefined);

    await new Promise((resolve) => setTimeout(resolve, 300));

    setIsAddingToCart(false);
    addToast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      type: "success",
    });
  };

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

  // Loading state with skeleton
  if (isLoading) {
    return (
      <main className="min-h-screen bg-white pb-8 pt-6">
        <Container>
          <div className="gap-8 md:grid md:grid-cols-2 lg:gap-12">
            <div className="aspect-square animate-pulse rounded-3xl bg-gray-100" />
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
            <Button className="rounded-full bg-[#0A5565] px-8 py-3 text-base font-medium text-white hover:bg-[#083d4a]">
              Browse All Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Container>
        {/* Breadcrumb */}
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
            {/* Left Panel - Product Images */}
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

                    {!isZoomed && (
                      <div className="pointer-events-none absolute bottom-20 left-1/2 hidden -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 md:block">
                        Hover to zoom
                      </div>
                    )}
                  </>
                )}

                {/* Sale Badge */}
                {new Date() < new Date("2025-12-02T05:59:59Z") && (
                  <div className="absolute left-4 top-4 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A5565] px-3 py-1.5 text-xs font-semibold text-white">
                      15% OFF — Code: STITCHIT
                    </span>
                  </div>
                )}

                {/* Navigation Arrows */}
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

                {/* Image Dots */}
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

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="mt-4 hidden gap-2 overflow-x-auto pb-2 md:flex">
                  {allImages.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        currentImageIndex === idx
                          ? "border-[#0A5565] ring-2 ring-[#0A5565]/20"
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

            {/* Right Panel - Product Details */}
            <div className="pt-6 md:pt-0">
              <div className="space-y-6">
                {/* Header Section */}
                <header>
                  <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                    {product.name}
                  </h1>

                  {/* Price & Rating */}
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.averageRating && product.reviewCount ? (
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.averageRating ?? 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-600">
                          {product.averageRating.toFixed(1)} (
                          {product.reviewCount} reviews)
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-[#0A5565]" />
                      <span>Local Pickup</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#0A5565]" />
                      <span>5-7 Day Turnaround</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-[#0A5565]" />
                      <span>Quality Guaranteed</span>
                    </div>
                  </div>
                </header>

                {/* Promo Alert */}
                {new Date() < new Date("2025-12-02T05:59:59Z") && (
                  <div className="rounded-2xl bg-[#0A5565] p-4 text-white">
                    <p className="flex items-center gap-2 font-semibold">
                      15% Off Sale — Ends Tonight!
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

                {/* Description */}
                <p className="leading-relaxed text-gray-600">
                  {product.description}
                </p>

                {/* Order Notes Section */}
                <div className="space-y-4 rounded-2xl bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900">
                    Order Notes (Optional)
                  </h3>
                  <div>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={3}
                      placeholder="Any special requests or instructions..."
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A5565]"
                    />
                  </div>
                </div>

                {/* Delivery Timeframe */}
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  5-7 business days (may vary if materials need to be ordered)
                </p>

                {/* Baby Clothes Reminder */}
                {product.requiresBabyClothes && (
                  <div className="rounded-xl border border-[#74CADC] bg-[#E6F7FA] p-4">
                    <p className="mb-1 text-sm font-semibold text-[#0A5565]">
                      Don&apos;t forget your baby clothes!
                    </p>
                    <p className="text-sm text-[#0A5565]">
                      Please bring your baby clothes within{" "}
                      {product.babyClothesDeadlineDays ?? 5} days of placing
                      your order.
                    </p>
                  </div>
                )}

                {/* CTA Section */}
                <div className="space-y-4 pt-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.inStock || isAddingToCart}
                    className={`w-full rounded-2xl py-6 text-lg font-semibold transition-colors ${
                      product.inStock
                        ? "bg-[#0A5565] text-white hover:bg-[#083d4a]"
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
                        Add to Cart — ${product.price.toFixed(2)}
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

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="mt-16 border-t pt-16">
              <h2 className="mb-8 text-2xl font-bold text-gray-900">
                Customer Reviews
              </h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-gray-200 p-6"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {review.customerName}
                          </span>
                          {review.verified && (
                            <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              <Shield className="h-3 w-3" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      {review.title}
                    </h3>
                    <p className="leading-relaxed text-gray-600">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Products Section */}
          {recommendedProducts.length > 0 && (
            <div className="mt-16 border-t pt-16">
              <h2 className="mb-8 text-2xl font-bold text-gray-900">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
                {recommendedProducts.map((recProduct) => (
                  <Link
                    key={recProduct.id}
                    href={`/shop/${recProduct.id}`}
                    className="group"
                  >
                    <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        src={recProduct.image}
                        alt={recProduct.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-[#0A5565]">
                      {recProduct.name}
                    </h3>
                    <p className="font-medium text-gray-600">
                      ${recProduct.price.toFixed(2)}
                    </p>
                    {recProduct.averageRating && recProduct.reviewCount ? (
                      <div className="mt-1 flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(recProduct.averageRating ?? 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({recProduct.reviewCount})
                        </span>
                      </div>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-4 md:hidden">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAddingToCart}
          className={`w-full rounded-xl py-4 text-base font-semibold ${
            product.inStock
              ? "bg-[#0A5565] text-white hover:bg-[#083d4a]"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {isAddingToCart
            ? "Adding..."
            : product.inStock
              ? `Add to Cart — $${product.price.toFixed(2)}`
              : "Out of Stock"}
        </Button>
      </div>

      {/* Spacer for mobile sticky CTA */}
      <div className="h-20 md:hidden" />
    </main>
  );
}
