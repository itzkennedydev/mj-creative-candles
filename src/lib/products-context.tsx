"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "./types";

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
    id: 2,
    name: "Black T-Shirt",
    description: "Comfortable 50-50 cotton poly blend black t-shirt, perfect for custom embroidery",
    price: 22.00,
    image: "/placeholder-black-tshirt.png",
    category: "Apparel",
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"]
  },
  {
    id: 3,
    name: "Black Hoodie",
    description: "Warm and cozy 50-50 cotton poly blend black hoodie, ideal for custom embroidery",
    price: 35.00,
    image: "/placeholder-black-hoodie.png",
    category: "Apparel",
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"]
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


// Monday, Tuesday, Thursday, Friday 10am - 4:30pm 
// every other Saturday 10am - 2pm 