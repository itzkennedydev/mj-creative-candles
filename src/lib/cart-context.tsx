"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "./types";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => {
    const itemId = `${product.id}-${selectedSize ?? 'default'}-${selectedColor ?? 'default'}`;
    
    setItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
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
        selectedColor
      }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => 
      `${item.product.id}-${item.selectedSize ?? 'default'}-${item.selectedColor ?? 'default'}` !== itemId
    ));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prev => prev.map(item => {
      const currentItemId = `${item.product.id}-${item.selectedSize ?? 'default'}-${item.selectedColor ?? 'default'}`;
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
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
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
