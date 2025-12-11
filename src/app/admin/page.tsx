"use client";

import { MainNav } from "../sca-dashboard/components/layout/main-nav";
import { AppSidebarNav } from "../sca-dashboard/components/layout/sidebar/app-sidebar-nav";
import { HelpButton } from "../sca-dashboard/components/layout/sidebar/help-button";
import { SettingsButton } from "../sca-dashboard/components/layout/sidebar/settings-button";
import { PageContent } from "../sca-dashboard/components/layout/page-content";
import { PageWidthWrapper } from "../sca-dashboard/components/layout/page-width-wrapper";
import { useOrders } from "~/lib/hooks/use-orders";
import { useEffect, useState, useMemo, useCallback } from "react";
import { MiniAreaChart } from "../sca-dashboard/components/ui/mini-area-chart";
import { StatusBadge } from "~/lib/status-badge-utils";
import { Button } from "../sca-dashboard/components/ui/button";
import { 
  RefreshCw,
  ListFilter,
  ShoppingCart,
  Search,
} from "lucide-react";
import { Input } from "../sca-dashboard/components/ui/input";
import { Combobox, type ComboboxOption } from "../sca-dashboard/components/ui/combobox";
import { OrderDetailModal } from "./components/order-detail-modal";
import type { Order } from "~/lib/order-types";
import Image from "next/image";
import { ErrorBoundary } from "./components/error-boundary";

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
  revenueOverTime: Array<{
    _id: Record<string, number> | number;
    revenue: number;
    orderCount: number;
  }>;
  topProducts: Array<{
    name: string;
    revenue: number;
    unitsSold: number;
  }>;
}

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useOrders(
    currentPage,
    debouncedSearchQuery,
    statusFilter,
    isAuthenticated
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Check if user is authenticated and fetch data in parallel
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    setIsAuthenticated(!!token);
    
    // Fetch analytics immediately if authenticated
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        const response = await fetch('/api/orders/analytics?period=all&groupBy=day', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = (await response.json()) as AnalyticsData;
          setAnalytics(data);
        } else {
          setAnalyticsError('Failed to load analytics data');
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setAnalyticsError('Failed to load analytics data');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    
    void fetchAnalytics();
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Extract duplicate date parsing logic
  const parseChartDate = useCallback((item: { _id: Record<string, number> | number }) => {
    if (typeof item._id === "object" && item._id !== null && !Array.isArray(item._id)) {
      const id = item._id as Record<string, unknown>;
      const year = typeof id.year === "number" ? id.year : new Date().getFullYear();
      const month = (typeof id.month === "number" ? id.month : 1) - 1;
      const day = typeof id.day === "number" ? id.day : 1;
      const hour = typeof id.hour === "number" ? id.hour : 0;
      return new Date(year, month, day, hour);
    } else if (typeof item._id === "number" || typeof item._id === "string") {
      return new Date(item._id);
    }
    return new Date();
  }, []);

  // Memoize status filter options
  const statusOptions = useMemo<ComboboxOption[]>(() => [
    { label: "All Statuses", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Ready for Pickup", value: "ready_for_pickup" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Paid", value: "paid" },
    { label: "Cancelled", value: "cancelled" },
  ], []);

  // Helper to create default chart data
  const createDefaultChartData = useCallback(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return [
      { date: weekAgo, value: 0 },
      { date: now, value: 0 },
    ];
  }, []);

  // Prepare chart data for mini charts - optimized with shared logic
  const revenueChartData = useMemo(() => {
    if (!analytics?.revenueOverTime || analytics.revenueOverTime.length === 0) {
      return createDefaultChartData();
    }
    
    return analytics.revenueOverTime
      .map((item) => ({
        date: parseChartDate(item),
        value: item.revenue,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [analytics?.revenueOverTime, parseChartDate, createDefaultChartData]);

  const ordersChartData = useMemo(() => {
    if (!analytics?.revenueOverTime || analytics.revenueOverTime.length === 0) {
      return createDefaultChartData();
    }
    
    return analytics.revenueOverTime
      .map((item) => ({
        date: parseChartDate(item),
        value: item.orderCount,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [analytics?.revenueOverTime, parseChartDate, createDefaultChartData]);

  const avgOrderValueChartData = useMemo(() => {
    if (!analytics?.revenueOverTime || analytics.revenueOverTime.length === 0) {
      return createDefaultChartData();
    }
    
    return analytics.revenueOverTime
      .map((item) => ({
        date: parseChartDate(item),
        value: item.orderCount > 0 ? item.revenue / item.orderCount : 0,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [analytics?.revenueOverTime, parseChartDate, createDefaultChartData]);


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Authentication Required</h1>
          <p className="text-neutral-500">Please log in to access the dashboard.</p>
        </div>
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
      <PageContent title="Dashboard">
        <ErrorBoundary>
          <div className="pb-10">
            <PageWidthWrapper>
              <div className="space-y-8">
          {/* Metrics Cards */}
          <section className="grid w-full grid-cols-3 gap-2 overflow-x-auto sm:gap-4">
            <button className="flex justify-between gap-4 rounded-xl border bg-white px-5 py-4 text-left transition-[box-shadow] focus:outline-none border-neutral-200 focus-visible:border-black sm:border-neutral-200 sm:focus-visible:border-black">
              <div>
                <p className="text-sm text-neutral-600">Total Revenue</p>
                <div className="mt-2">
                  <span className="text-2xl transition-opacity">
                    {analyticsLoading ? (
                      <span className="inline-block h-7 w-24 bg-neutral-200 animate-pulse rounded" />
                    ) : analyticsError ? (
                      'Error'
                    ) : analytics ? formatCurrency(analytics.summary.totalRevenue) : '$0.00'}
                  </span>
                </div>
              </div>
              {!analyticsLoading && !analyticsError && (
                <div className="relative h-full max-w-[140px] grow transition-opacity hidden sm:block">
                  <div className="relative" style={{ width: '140px', height: '64px' }}>
                    <MiniAreaChart
                      data={revenueChartData}
                      curve={true}
                      padding={{ top: 8, right: 2, bottom: 2, left: 2 }}
                    />
                  </div>
                </div>
              )}
            </button>

            <button className="flex justify-between gap-4 rounded-xl border bg-white px-5 py-4 text-left transition-[box-shadow] focus:outline-none border-neutral-200 focus-visible:border-black sm:border-neutral-200 sm:focus-visible:border-black">
              <div>
                <p className="text-sm text-neutral-600">Total Orders</p>
                <div className="mt-2">
                  <span className="text-2xl transition-opacity">
                    {analyticsLoading ? (
                      <span className="inline-block h-7 w-16 bg-neutral-200 animate-pulse rounded" />
                    ) : analyticsError ? (
                      'Error'
                    ) : analytics ? analytics.summary.totalOrders : 0}
                  </span>
                </div>
              </div>
              {!analyticsLoading && !analyticsError && (
                <div className="relative h-full max-w-[140px] grow transition-opacity hidden sm:block">
                  <div className="relative" style={{ width: '140px', height: '64px' }}>
                    <MiniAreaChart
                      data={ordersChartData}
                      curve={true}
                      padding={{ top: 8, right: 2, bottom: 2, left: 2 }}
                    />
                  </div>
                </div>
              )}
            </button>

            <button className="flex justify-between gap-4 rounded-xl border bg-white px-5 py-4 text-left transition-[box-shadow] focus:outline-none border-neutral-200 focus-visible:border-black sm:border-neutral-200 sm:focus-visible:border-black">
              <div>
                <p className="text-sm text-neutral-600">Avg Order Value</p>
                <div className="mt-2">
                  <span className="text-2xl transition-opacity">
                    {analyticsLoading ? (
                      <span className="inline-block h-7 w-24 bg-neutral-200 animate-pulse rounded" />
                    ) : analyticsError ? (
                      'Error'
                    ) : analytics ? formatCurrency(analytics.summary.avgOrderValue) : '$0.00'}
                  </span>
                </div>
              </div>
              {!analyticsLoading && !analyticsError && (
                <div className="relative h-full max-w-[140px] grow transition-opacity hidden sm:block">
                  <div className="relative" style={{ width: '140px', height: '64px' }}>
                    <MiniAreaChart
                      data={avgOrderValueChartData}
                      curve={true}
                      padding={{ top: 8, right: 2, bottom: 2, left: 2 }}
                    />
                  </div>
                </div>
              )}
            </button>
          </section>

          {/* Filters and Search */}
          <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Combobox
              selected={
                statusFilter
                  ? {
                      label:
                        statusFilter === "pending"
                          ? "Pending"
                          : statusFilter === "processing"
                            ? "Processing"
                            : statusFilter === "ready_for_pickup"
                              ? "Ready for Pickup"
                              : statusFilter === "shipped"
                                ? "Shipped"
                                : statusFilter === "delivered"
                                  ? "Delivered"
                                  : statusFilter === "paid"
                                    ? "Paid"
                                    : statusFilter === "cancelled"
                                      ? "Cancelled"
                                      : statusFilter,
                      value: statusFilter,
                    }
                  : null
              }
              setSelected={(option: ComboboxOption | null) => setStatusFilter(option?.value ?? "")}
              options={statusOptions}
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
          </section>

          {/* Orders Table */}
          <section>
            <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">Loading orders...</p>
                  </div>
                ) : ordersData?.orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                    <p className="text-sm text-neutral-500">No orders found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 font-medium">Order #</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Total</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordersData?.orders.map((order) => {
                          const orderId = typeof order._id === 'string' ? order._id : order._id?.toString() ?? '';
                          const createdAt = order.createdAt instanceof Date
                            ? order.createdAt.toISOString()
                            : typeof order.createdAt === 'string'
                              ? order.createdAt
                              : '';
                          return (
                            <tr 
                              key={orderId} 
                              className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsOrderModalOpen(true);
                              }}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative h-8 w-8 rounded-full shrink-0 overflow-hidden bg-neutral-100">
                                    <Image
                                      src={`https://avatar.vercel.sh/${order.customer.email}`}
                                      alt={`${order.customer.firstName} ${order.customer.lastName}`}
                                      fill
                                      className="object-cover"
                                      sizes="32px"
                                      unoptimized
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {order.customer.firstName} {order.customer.lastName}
                                    </div>
                                    <div className="text-sm text-neutral-500">
                                      {order.customer.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-medium">{order.orderNumber}</span>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {createdAt ? formatDate(createdAt) : 'N/A'}
                              </td>
                              <td className="py-3 px-4 font-medium">
                                {formatCurrency(order.total)}
                              </td>
                              <td className="py-3 px-4">
                                <StatusBadge status={order.status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {ordersData && (ordersData.totalPages ?? 0) > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-neutral-500">
                      Page {currentPage} of {ordersData.totalPages ?? 1}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        text="Previous"
                        className="bg-white"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={currentPage >= (ordersData?.totalPages ?? 0)}
                        text="Next"
                        className="bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Top Products */}
          {analyticsLoading && (
            <section>
              <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 w-48 bg-neutral-200 rounded" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-neutral-100 rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          {!analyticsLoading && analytics && analytics.topProducts.length > 0 && (
            <section>
              <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4 text-neutral-900">Top Products</h2>
                  <div className="space-y-2">
                    {analytics.topProducts.slice(0, 5).map((product, index) => (
                      <div
                        key={product.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-neutral-50"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-sm font-medium text-neutral-500 shrink-0 w-6">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-neutral-900 truncate">{product.name}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {product.unitsSold} {product.unitsSold === 1 ? 'unit' : 'units'} sold
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-neutral-900 shrink-0 ml-4">
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
              </div>
            </PageWidthWrapper>
          </div>
        </ErrorBoundary>
      </PageContent>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={isOrderModalOpen}
        onOpenChange={setIsOrderModalOpen}
      />
    </MainNav>
  );
}

