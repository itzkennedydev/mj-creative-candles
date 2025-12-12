"use client";

import { useState } from "react";
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

interface OrderDetails {
  orderNumber: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  completedAt?: Date;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    selectedSize?: string;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shipping: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const statusInfo: Record<
  string,
  { label: string; icon: typeof Package; color: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
  },
  paid: {
    label: "Payment Received",
    icon: CheckCircle,
    color: "text-green-600",
  },
  processing: {
    label: "Processing",
    icon: Package,
    color: "text-blue-600",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    icon: Package,
    color: "text-green-600",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "text-blue-600",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-600",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
  },
  payment_failed: {
    label: "Payment Failed",
    icon: XCircle,
    color: "text-red-600",
  },
};

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrderDetails(null);
    setLoading(true);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, orderNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to track order");
      }

      setOrderDetails(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const status = orderDetails?.status || "pending";
  const StatusIcon = statusInfo[status]?.icon || Package;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Track Your Order
            </h1>
            <p className="mt-2 text-gray-600">
              Enter your email to view your order status
            </p>
          </div>

          {!orderDetails ? (
            <div className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-sm border border-gray-300 px-4 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="orderNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Order Number{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="mt-1 block w-full rounded-sm border border-gray-300 px-4 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="1234567890"
                  />
                </div>

                {error && (
                  <div className="rounded-sm bg-red-50 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  variant="primary"
                >
                  {loading ? "Tracking..." : "Track Order"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Card */}
              <div className="rounded-sm border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Order {orderDetails.orderNumber}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Placed on {formatDate(orderDetails.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      className={`h-6 w-6 ${statusInfo[status]?.color || "text-gray-600"}`}
                    />
                    <span
                      className={`text-lg font-medium ${statusInfo[status]?.color || "text-gray-900"}`}
                    >
                      {statusInfo[status]?.label || status}
                    </span>
                  </div>
                </div>

                {orderDetails.paidAt && (
                  <p className="mt-2 text-sm text-gray-600">
                    Payment received on {formatDate(orderDetails.paidAt)}
                  </p>
                )}

                {orderDetails.completedAt && (
                  <p className="mt-2 text-sm text-gray-600">
                    Completed on {formatDate(orderDetails.completedAt)}
                  </p>
                )}
              </div>

              {/* Items */}
              <div className="rounded-sm border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Order Items
                </h3>
                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.productName}
                        </p>
                        {item.selectedSize && (
                          <p className="text-sm text-gray-600">
                            Size: {item.selectedSize}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      {formatCurrency(orderDetails.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">
                      {formatCurrency(orderDetails.tax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {formatCurrency(orderDetails.shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">
                      {formatCurrency(orderDetails.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="rounded-sm border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Shipping Address
                </h3>
                <address className="not-italic text-gray-600">
                  {orderDetails.shipping.street}
                  <br />
                  {orderDetails.shipping.city}, {orderDetails.shipping.state}{" "}
                  {orderDetails.shipping.zipCode}
                  <br />
                  {orderDetails.shipping.country}
                </address>
              </div>

              <Button
                onClick={() => {
                  setOrderDetails(null);
                  setEmail("");
                  setOrderNumber("");
                }}
                variant="secondary"
                className="w-full"
              >
                Track Another Order
              </Button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
