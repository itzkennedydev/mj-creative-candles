'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
            gcTime: 60 * 60 * 1000, // 1 hour cache retention
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch if data exists
            refetchOnReconnect: false,
            networkMode: 'offlineFirst', // Use cache first, then network
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
