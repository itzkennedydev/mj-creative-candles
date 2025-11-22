"use client";

import { MainNav } from "../../sca-dashboard/components/layout/main-nav";
import { AppSidebarNav } from "../../sca-dashboard/components/layout/sidebar/app-sidebar-nav";
import { HelpButton } from "../../sca-dashboard/components/layout/sidebar/help-button";
import { SettingsButton } from "../../sca-dashboard/components/layout/sidebar/settings-button";
import { PageContent } from "../../sca-dashboard/components/layout/page-content";
import { PageWidthWrapper } from "../../sca-dashboard/components/layout/page-width-wrapper";
import { useOrders } from "~/lib/hooks/use-orders";
import { useEffect, useState, useCallback, useMemo } from "react";
import { StatusBadge } from "~/lib/status-badge-utils";
import { Button } from "../../sca-dashboard/components/ui/button";
import { Input } from "../../sca-dashboard/components/ui/input";
import { Combobox, type ComboboxOption } from "../../sca-dashboard/components/ui/combobox";
import { 
  RefreshCw,
  Eye,
  Package,
  Calendar,
  DollarSign,
  ListFilter,
  Search,
} from "lucide-react";
import { OrderDetailModal } from "../components/order-detail-modal";
import type { Order as OrderType } from "~/lib/order-types";
import Image from "next/image";

interface Order {
  _id?: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    setIsAuthenticated(!!token);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const { data: ordersData, isLoading, refetch } = useOrders(
    currentPage,
    searchQuery,
    statusFilter || undefined,
    isAuthenticated
  );

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const orders = ordersData?.orders || [];
  const totalPages = ordersData?.totalPages ?? 1;
  const totalCount = ordersData?.total ?? 0;

  // Memoize order rows to prevent unnecessary re-renders
  const orderRows = useMemo(() => {
    return orders.map((order: any) => {
      const orderId = typeof order._id === 'string' ? order._id : order._id?.toString() ?? '';
      const createdAt = order.createdAt instanceof Date
        ? order.createdAt.toISOString()
        : typeof order.createdAt === 'string'
          ? order.createdAt
          : '';
      return {
        ...order,
        orderId,
        createdAt,
      };
    });
  }, [orders]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-500">Please login to access orders</p>
      </div>
    );
  }

  return (
    <MainNav
      sidebar={AppSidebarNav}
      toolContent={
        <>
            <SettingsButton />
          <HelpButton />
        </>
      }
    >
      <PageContent title="Orders">
        <div className="pb-10">
          <PageWidthWrapper>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">
                    Manage and track all customer orders
                  </p>
                </div>
                <Button
                  onClick={() => void refetch()}
                  variant="outline"
                  text="Refresh"
                  icon={<RefreshCw className="h-4 w-4" />}
                />
              </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Combobox
            options={[
              { label: "All Statuses", value: "" },
              { label: "Pending", value: "pending" },
              { label: "Processing", value: "processing" },
              { label: "Completed", value: "completed" },
              { label: "Shipped", value: "shipped" },
              { label: "Cancelled", value: "cancelled" },
            ]}
            selected={statusFilter ? { label: statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1), value: statusFilter } : null}
            setSelected={(option: ComboboxOption | null) => setStatusFilter(option?.value || "")}
            placeholder="Filter"
            icon={ListFilter}
            buttonProps={{ className: "w-full md:w-fit" }}
          />
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10">
              <Search className="h-4 w-4 text-neutral-400" />
            </div>
            <Input
              className="peer w-full rounded-md border border-neutral-200 px-10 text-black outline-none placeholder:text-neutral-400 sm:text-sm transition-all focus:border-neutral-500 focus:ring-4 focus:ring-neutral-200 md:w-[16rem]"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoCapitalize="none"
              type="text"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Order #</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Total</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map((order) => (
                    <tr 
                      key={order.orderId} 
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedOrder(order as OrderType);
                        setIsOrderModalOpen(true);
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-8 w-8 rounded-full shrink-0 overflow-hidden bg-neutral-100">
                            <Image
                              src={`https://avatar.vercel.sh/${order.customer?.email || 'unknown'}`}
                              alt={`${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`}
                              fill
                              className="object-cover"
                              sizes="32px"
                              unoptimized
                            />
                          </div>
                          <div>
                            <div className="font-medium">
                              {order.customer?.firstName} {order.customer?.lastName}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {order.customer?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{order.orderNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order as OrderType);
                            setIsOrderModalOpen(true);
                          }}
                          icon={<Eye className="h-4 w-4" />}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-600">
                Showing <span className="font-medium text-neutral-900">{orders.length > 0 ? ((currentPage - 1) * 10 + 1) : 0}</span> to <span className="font-medium text-neutral-900">{Math.min(currentPage * 10, totalCount)}</span> of <span className="font-medium text-neutral-900">{totalCount}</span> orders
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-500 mr-2">
                Page {currentPage} of {totalPages}
              </p>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                text="Previous"
                className="w-auto min-w-[100px]"
              />
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
                text="Next"
                className="w-auto min-w-[100px]"
              />
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        <OrderDetailModal
          order={selectedOrder}
          open={isOrderModalOpen}
          onOpenChange={(open) => {
            setIsOrderModalOpen(open);
            if (!open) {
              setSelectedOrder(null);
            }
          }}
          onOrderUpdated={() => {
            void refetch();
          }}
        />
            </div>
          </PageWidthWrapper>
        </div>
      </PageContent>
    </MainNav>
  );
}

