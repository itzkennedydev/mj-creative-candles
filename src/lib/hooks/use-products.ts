import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Product } from '~/lib/types';

interface ProductsResponse {
  success?: boolean;
  products?: Product[];
  total?: number;
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products', {
    // Use cache for faster subsequent loads
    cache: 'force-cache',
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json() as unknown;
  if (Array.isArray(data)) {
    return data as Product[];
  }
  const obj = data as ProductsResponse;
  if (Array.isArray(obj.products)) {
    return obj.products;
  }
  return [];
}

export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 10 * 60 * 1000, // 10 minutes fresh
    gcTime: 60 * 60 * 1000, // 1 hour cache
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData, // Show stale data while fetching
  });
}

// Hook to prefetch products - call early for faster loads
export function usePrefetchProducts() {
  const queryClient = useQueryClient();
  
  return () => {
    void queryClient.prefetchQuery({
      queryKey: ['products'],
      queryFn: fetchProducts,
      staleTime: 10 * 60 * 1000,
    });
  };
}

