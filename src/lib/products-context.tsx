"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { Product } from "./types";

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('adminToken');
}

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  loading: boolean;
  error: string | null;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      interface ProductsResponseShape { products?: Product[] }
      const raw = await response.json() as unknown;
      const isProductsResponse = (val: unknown): val is ProductsResponseShape =>
        typeof val === 'object' && val !== null && Array.isArray((val as { products?: unknown }).products);
      const list: Product[] = Array.isArray(raw)
        ? (raw as Product[])
        : (isProductsResponse(raw) ? raw.products ?? [] : []);
      setProducts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    void fetchProducts();
  }, []);

  const addProduct = useCallback(async (productData: Omit<Product, "id">) => {
    try {
      setError(null);
      const token = getAdminToken();
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const newProduct = await response.json() as Product;
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, productData: Partial<Product>) => {
    try {
      setError(null);
      const token = getAdminToken();
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const updatedProduct = await response.json() as Product;
      setProducts(prev =>
        prev.map(product =>
          product.id === id ? updatedProduct : product
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setError(null);
      const token = getAdminToken();
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  }, []);

  const getProduct = useCallback((id: string) => {
    return products.find(product => product.id === id);
  }, [products]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    loading,
    error
  }), [products, addProduct, updateProduct, deleteProduct, getProduct, loading, error]);

  return (
    <ProductsContext.Provider value={contextValue}>
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
