export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

import type { ObjectId } from 'mongodb';

export interface Order {
  _id?: ObjectId | string;
  orderNumber: string;
  customer: CustomerInfo;
  shipping: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'processing' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled' | 'paid' | 'payment_failed';
  paymentMethod: 'card';
  paymentIntentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  failureReason?: string;
  emailsSent?: boolean;
  emailsSentAt?: Date;
}

export interface CreateOrderRequest {
  customer: CustomerInfo;
  shipping: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentMethod: 'card';
  notes?: string;
}
