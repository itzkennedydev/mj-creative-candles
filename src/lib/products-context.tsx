"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "./types";

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  getProduct: (id: number) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Initial products data
const initialProducts: Product[] = [
  {
    id: 1,
    name: "Custom Embroidered T-Shirt",
    price: 25.00,
    inStock: true,
    description: "High-quality cotton t-shirt with custom embroidery",
    image: "/categories/Tops.jpeg",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Navy"]
  }
];

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: Math.max(...products.map(p => p.id), 0) + 1
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: number, productData: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...productData } : product
      )
    );
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProduct = (id: number) => {
    return products.find(product => product.id === id);
  };

  return (
    <ProductsContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
