"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Product } from "~/lib/types";
import { Button } from "~/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "~/lib/cart-context";
import { useToast } from "~/lib/toast-context";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();
  const { addToast } = useToast();

  // Create array of all images including primary
  const allImages = product.image ? [
    { src: product.image, isPrimary: true },
    ...(product.images || []).map(img => ({ src: img.dataUri, isPrimary: false }))
  ] : (product.images || []).map(img => ({ src: img.dataUri, isPrimary: false }));

  // Calculate price with XXL surcharge
  const displayPrice = product.price + (selectedSize === 'XXL' ? 3 : 0);

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
    
    addItem(product, quantity, selectedSize, selectedColor);
    addToast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      type: "success"
    });
  };

  return (
    <div className="bg-white">
      {/* Product Image */}
      <div className="aspect-square relative mb-6 rounded-lg overflow-hidden">
        {allImages.length > 0 && (
          <Image
            src={allImages[currentImageIndex]?.src ?? '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
        
        {/* Image Navigation Dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentImageIndex === idx ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Product Details */}
      <div className="space-y-4 md:space-y-6">
        <div>
          <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">{product.name}</h3>
          <p className="text-sm md:text-base text-gray-600">{product.description}</p>
        </div>
        
        <div className="text-xl md:text-2xl font-medium text-gray-900">
          ${displayPrice.toFixed(2)}
        </div>

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Size</label>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 md:px-4 py-2 text-sm border rounded-md transition-colors ${
                    selectedSize === size
                      ? "border-gray-900 text-gray-900"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection */}
        {product.colors && product.colors.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">Color</label>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 md:px-4 py-2 text-sm border rounded-md transition-colors ${
                    selectedColor === color
                      ? "border-gray-900 text-gray-900"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div>
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
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-2 md:py-3 text-sm md:text-base font-medium"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}