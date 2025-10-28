import { useQuery, useQueryClient } from '@tanstack/react-query';
import { env } from '~/env';
import type { ProductImage } from '~/lib/types';

interface GalleryResponse {
  images: ProductImage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchGalleryImages(): Promise<GalleryResponse> {
  const response = await fetch('/api/images/gallery?page=1&limit=50', {
    headers: {
      'x-admin-password': env.NEXT_PUBLIC_ADMIN_PASSWORD as string,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch gallery images');
  }

  return await response.json() as GalleryResponse;
}

export function useGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: fetchGalleryImages,
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    retry: 1, // Only retry once
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
}

// Hook to prefetch gallery images
export function usePrefetchGallery() {
  const queryClient = useQueryClient();
  
  return () => {
    void queryClient.prefetchQuery({
      queryKey: ['gallery'],
      queryFn: fetchGalleryImages,
    });
  };
}

