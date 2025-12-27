"use client";
import { getProductPrice } from "./types";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "./types";
import { trackAddToCart } from "./analytics";
import dynamic from "next/dynamic";

// Dynamically import heavy ScentTypeform component
const ScentTypeform = dynamic(
  () => import("~/components/shop/scent-typeform").then((mod) => mod.ScentTypeform),
  { ssr: false }
);

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string,
    customColorValue?: string,
    embroideryName?: string,
    orderNotes?: string,
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isScentQuizOpen: boolean;
  openScentQuiz: () => void;
  closeScentQuiz: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isScentQuizOpen, setIsScentQuizOpen] = useState(false);

  // Listen for cart cleared event from success page
  useEffect(() => {
    const handleCartCleared = () => {
      setItems([]);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("cartCleared", handleCartCleared);
      return () => window.removeEventListener("cartCleared", handleCartCleared);
    }
  }, []);

  const addItem = useCallback((
    product: Product,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string,
    customColorValue?: string,
    embroideryName?: string,
    orderNotes?: string,
  ) => {
    // Get item price (no size surcharge for candles)
    const itemPrice = getProductPrice(product);

    // Track analytics
    trackAddToCart(product.id ?? "", product.name, itemPrice);

    setItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.customColorValue === customColorValue,
      );

      if (existingItem) {
        return prev.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...prev,
        {
          product,
          quantity,
          selectedSize,
          selectedColor,
          customColorValue,
          embroideryName,
          orderNotes,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          `${item.product.id}-${item.selectedColor ?? "default"}-${item.customColorValue ?? "default"}` !==
          itemId,
      ),
    );
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) =>
        prev.filter(
          (item) =>
            `${item.product.id}-${item.selectedColor ?? "default"}-${item.customColorValue ?? "default"}` !==
            itemId,
        ),
      );
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        const currentItemId = `${item.product.id}-${item.selectedColor ?? "default"}-${item.customColorValue ?? "default"}`;
        return currentItemId === itemId ? { ...item, quantity } : item;
      }),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((sum, item) => {
      const itemPrice = getProductPrice(item.product);
      return sum + itemPrice * item.quantity;
    }, 0);
  }, [items]);

  const openScentQuiz = useCallback(() => {
    setIsScentQuizOpen(true);
  }, []);

  const closeScentQuiz = useCallback(() => {
    setIsScentQuizOpen(false);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isScentQuizOpen,
    openScentQuiz,
    closeScentQuiz,
  }), [items, addItem, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice, isScentQuizOpen, openScentQuiz, closeScentQuiz]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      <ScentTypeform isOpen={isScentQuizOpen} onClose={closeScentQuiz} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
