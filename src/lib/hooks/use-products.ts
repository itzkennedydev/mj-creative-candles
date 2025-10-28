import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Product } from '~/lib/types';

interface ProductsResponse {
  products: Product[];
  total: number;
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return await response.json() as Product[];
}

export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
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

