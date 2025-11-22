import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Product } from '~/lib/types';

interface ProductsResponse {
  success?: boolean;
  products?: Product[];
  total?: number;
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json() as unknown;
  // Support both array and { success, products } shapes
  if (Array.isArray(data)) {
    return data as Product[];
  }
  const obj = data as ProductsResponse;
  if (Array.isArray(obj.products)) {
    return obj.products;
  }
  // Fallback to empty array to avoid runtime map errors
  return [];
}

export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 1, // Reduced retries for faster failure
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if data exists in cache
    refetchOnReconnect: false,
  });
}

// Hook to prefetch products
export function usePrefetchProducts() {
  const queryClient = useQueryClient();
  
  return () => {
    void queryClient.prefetchQuery({
      queryKey: ['products'],
      queryFn: fetchProducts,
    });
  };
}

