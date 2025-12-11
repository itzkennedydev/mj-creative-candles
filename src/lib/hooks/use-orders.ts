import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order } from '~/lib/order-types';

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface OrderUpdateResponse {
  success: boolean;
  message: string;
}

// Fetch orders with pagination and search
export function useOrders(page = 1, searchQuery = '', statusFilter = '', isAuthenticated = false) {
  return useQuery({
    queryKey: ['orders', page, searchQuery, statusFilter],
    queryFn: async (): Promise<OrdersResponse> => {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json() as { success: boolean; orders: Order[]; totalCount: number; totalPages: number; page: number };
      return {
        success: data.success,
        orders: data.orders,
        total: data.totalCount,
        totalPages: data.totalPages,
        currentPage: data.page
      };
    },
    enabled: isAuthenticated, // Only run query if authenticated
    staleTime: 30 * 1000, // 30 seconds - data is fresh for 30s
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
    refetchOnReconnect: true, // Refetch when connection is restored
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) => {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const body: { status: string; notes?: string } = { status };
      if (notes !== undefined) {
        body.notes = notes;
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      return response.json() as Promise<OrderUpdateResponse>;
    },
    onSuccess: () => {
      // Invalidate and refetch orders
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Send pickup notification
export function useSendPickupNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      pickupTime, 
      customMessage 
    }: { 
      orderId: string; 
      pickupTime: string; 
      customMessage: string; 
    }) => {
      const response = await fetch('/api/orders/send-pickup-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ orderId, pickupTime, customMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send pickup notification');
      }

      return response.json() as Promise<OrderUpdateResponse>;
    },
    onSuccess: () => {
      // Invalidate and refetch orders
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Archive/unarchive order
export function useArchiveOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, archived }: { orderId: string; archived: boolean }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ archived }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive order');
      }

      return response.json() as Promise<OrderUpdateResponse>;
    },
    onSuccess: () => {
      // Invalidate and refetch orders
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['burndown-orders'] });
      void queryClient.invalidateQueries({ queryKey: ['archived-orders'] });
    },
  });
}

// Send status update email
export function useSendStatusEmail() {
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/orders/send-status-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to send status email');
      }

      return response.json() as Promise<OrderUpdateResponse>;
    },
  });
}
