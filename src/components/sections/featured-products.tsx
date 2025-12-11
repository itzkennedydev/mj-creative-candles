"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { useCart } from "~/lib/cart-context";
import { useProductsQuery } from "~/lib/hooks/use-products";
import { getProductPrice } from "~/lib/types";
import { useState, useEffect } from "react";

export function FeaturedProducts() {
  const { addItem } = useCart();
  const { data: allProducts, isLoading } = useProductsQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Filter for featured/visible products only
  const products =
    allProducts
      ?.filter((p) => p.visibility === "visible" && p.featured)
      .slice(0, 20) || [];

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  if (isLoading) {
    return (
      <section className="mb-[90px] bg-white py-12 sm:py-16">
        <Container>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-2 text-gray-600">
              Hand-picked favorites from our collection
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-sm bg-gray-100"
              />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  const handleNext = () => {
    if (currentIndex + itemsPerView < products.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + itemsPerView,
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <section className="mb-[90px] bg-white py-12 sm:py-16">
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-2 text-gray-600">
              Hand-picked favorites from our collection
            </p>
          </div>

          <div className="hidden gap-2 sm:flex">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded-full border border-gray-300 p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex + itemsPerView >= products.length}
              className="rounded-full border border-gray-300 p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next products"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {visibleProducts.map((product) => {
            const price = getProductPrice(product);
            const isOnSale =
              product.salePrice &&
              product.salePrice < (product.regularPrice || 0);

            return (
              <div
                key={product.id}
                className="group overflow-hidden rounded-sm border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg"
              >
                <Link
                  href={`/shop/${product.id}`}
                  className="relative block aspect-square overflow-hidden bg-gray-100"
                >
                  <Image
                    src={
                      product.productImages?.[0] ||
                      product.image ||
                      "/images/placeholder.jpg"
                    }
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {isOnSale && (
                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                        SALE
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  <Link href={`/shop/${product.id}`}>
                    <h3 className="mb-1 font-semibold text-gray-900 transition-colors hover:text-gray-600">
                      {product.name}
                    </h3>
                  </Link>

                  {product.shortDescription && (
                    <p className="mb-2 line-clamp-1 text-sm text-gray-500">
                      {product.shortDescription}
                    </p>
                  )}

                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(price)}
                    </span>
                    {isOnSale && product.regularPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.regularPrice)}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => addItem(product, 1)}
                    className="w-full bg-black text-white transition-colors hover:bg-gray-800"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/shop">
            <Button className="bg-black px-8 py-3 text-white hover:bg-gray-800">
              View All Products
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
