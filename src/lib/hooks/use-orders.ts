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
export function useOrders(page = 1, searchQuery = '') {
  return useQuery({
    queryKey: ['orders', page, searchQuery],
    queryFn: async (): Promise<OrdersResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json() as Promise<OrdersResponse>;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ status }),
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

// Send status update email
export function useSendStatusEmail() {
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch('/api/orders/send-status-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`,
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
