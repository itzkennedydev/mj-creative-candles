"use client";
import { getProductPrice } from "./types";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "./types";
import { trackAddToCart } from "./analytics";
import { ScentTypeform } from "~/components/shop/scent-typeform";

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

  const addItem = (
    product: Product,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string,
    customColorValue?: string,
    embroideryName?: string,
    orderNotes?: string,
  ) => {
    // Calculate price with size surcharge
    const sizeSurcharge =
      selectedSize === "XXL" ? 3 : selectedSize === "3XL" ? 5 : 0;
    const itemPrice = getProductPrice(product) + sizeSurcharge;

    // Track analytics
    trackAddToCart(product.id ?? "", product.name, itemPrice);

    setItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
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
  };

  const removeItem = (itemId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          `${item.product.id}-${item.selectedSize ?? "default"}-${item.selectedColor ?? "default"}-${item.customColorValue ?? "default"}` !==
          itemId,
      ),
    );
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        const currentItemId = `${item.product.id}-${item.selectedSize ?? "default"}-${item.selectedColor ?? "default"}-${item.customColorValue ?? "default"}`;
        return currentItemId === itemId ? { ...item, quantity } : item;
      }),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => {
      const sizeSurcharge =
        item.selectedSize === "XXL" ? 3 : item.selectedSize === "3XL" ? 5 : 0;
      const itemPrice = getProductPrice(item.product) + sizeSurcharge;
      return sum + itemPrice * item.quantity;
    }, 0);
  };

  const openScentQuiz = () => {
    setIsScentQuizOpen(true);
  };

  const closeScentQuiz = () => {
    setIsScentQuizOpen(false);
  };

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
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
