"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "./types";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string, customColorValue?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Listen for cart cleared event from success page
  useEffect(() => {
    const handleCartCleared = () => {
      setItems([]);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cartCleared', handleCartCleared);
      return () => window.removeEventListener('cartCleared', handleCartCleared);
    }
  }, []);

  const addItem = (product: Product, quantity: number, selectedSize?: string, selectedColor?: string, customColorValue?: string) => {
    setItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor &&
        item.customColorValue === customColorValue
      );
      
      if (existingItem) {
        return prev.map(item => 
          item === existingItem 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, {
        product,
        quantity,
        selectedSize,
        selectedColor,
        customColorValue
      }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => 
      `${item.product.id}-${item.selectedSize ?? 'default'}-${item.selectedColor ?? 'default'}-${item.customColorValue ?? 'default'}` !== itemId
    ));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prev => prev.map(item => {
      const currentItemId = `${item.product.id}-${item.selectedSize ?? 'default'}-${item.selectedColor ?? 'default'}-${item.customColorValue ?? 'default'}`;
      return currentItemId === itemId ? { ...item, quantity } : item;
    }));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => {
      const sizeSurcharge = item.selectedSize === 'XXL' ? 3 : item.selectedSize === '3XL' ? 5 : 0;
      const itemPrice = item.product.price + sizeSurcharge;
      return sum + (itemPrice * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
