"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { Activity, Search, Filter, Eye, Archive } from "lucide-react";
import type { Order } from "~/lib/order-types";
import { OrderTimer } from "./order-timer";

interface OrdersProps {
  orders: Order[];
  ordersLoading: boolean;
  totalOrders: number;
  totalPages: number;
  currentPage: number;
  ordersPerPage: number;
  searchQuery: string;
  statusFilter: string;
  viewMode: "grid" | "table";
  onSearch: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onPageChange: (page: number) => void;
  onViewModeChange: (mode: "grid" | "table") => void;
  onRefetchOrders: () => void;
  onViewOrder: (order: Order) => void;
  onStatusChange: (orderId: string, status: string) => void;
  onPickupReady: (order: Order) => void;
  onArchiveOrder: (orderId: string, archived: boolean) => void;
}

export function Orders({
  orders,
  ordersLoading,
  totalOrders,
  totalPages,
  currentPage,
  ordersPerPage,
  searchQuery,
  statusFilter,
  viewMode,
  onSearch,
  onStatusFilterChange,
  onPageChange,
  onViewModeChange,
  onRefetchOrders,
  onViewOrder,
  onStatusChange,
  onPickupReady,
  onArchiveOrder,
}: OrdersProps) {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Manage customer orders and fulfillment</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onViewModeChange(viewMode === "grid" ? "table" : "grid")}
            className="flex items-center gap-2"
          >
            {viewMode === "grid" ? "Table View" : "Grid View"}
          </Button>
          <Button
            variant="outline"
            onClick={onRefetchOrders}
            disabled={ordersLoading}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {ordersLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by number, customer name, or email..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC]"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="h-12 pl-10 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] bg-white appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {(searchQuery || statusFilter) && (
            <Button
              onClick={() => {
                onSearch("");
                onStatusFilterChange("");
              }}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 py-3 px-4"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      {(searchQuery || statusFilter) && (
        <p className="text-sm text-gray-500 mt-3">
          {searchQuery && statusFilter ? (
            <>Showing results for &quot;{searchQuery}&quot; with status &quot;{statusFilter}&quot; ({totalOrders} orders found)</>
          ) : searchQuery ? (
            <>Showing results for &quot;{searchQuery}&quot; ({totalOrders} orders found)</>
          ) : (
            <>Showing orders with status &quot;{statusFilter}&quot; ({totalOrders} orders found)</>
          )}
        </p>
      )}

      {ordersLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Time Elapsed</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 pr-8 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const orderId = order._id?.toString() ?? order.orderNumber;
                  
                  return (
                    <tr key={orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{order.customer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <OrderTimer createdAt={order.createdAt} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items.map(item => item.productName).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          ${(order.total ?? 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 h-8">
                          {order.status === 'processing' && (
                            <Button
                              onClick={() => onPickupReady(order)}
                              className="px-2 py-1.5 text-xs bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] rounded-md h-8"
                            >
                              Mark Ready
                            </Button>
                          )}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-900 h-8 w-8 p-0"
                              onClick={() => onViewOrder(order)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!order.archived && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onArchiveOrder(order._id!.toString(), true)}
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                                title="Archive order"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <select
                            value={order.status}
                            onChange={(e) => onStatusChange(order._id!.toString(), e.target.value)}
                            className={`text-xs font-medium rounded-md border px-2 py-1.5 h-8 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 ${
                              order.status === 'pending' ? 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100 focus:ring-orange-200' :
                              order.status === 'processing' ? 'bg-[#74CADC]/10 text-[#0A5565] border-[#74CADC]/30 hover:bg-[#74CADC]/20 focus:ring-[#74CADC]/20' :
                              order.status === 'ready_for_pickup' ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100 focus:ring-green-200' :
                              order.status === 'delivered' ? 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100 focus:ring-gray-200' :
                              'bg-red-50 text-red-800 border-red-300 hover:bg-red-100 focus:ring-red-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="ready_for_pickup">Ready for Pickup</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id?.toString() ?? order.orderNumber} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {new Date(order.createdAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <OrderTimer createdAt={order.createdAt} />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewOrder(order)}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!order.archived && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onArchiveOrder(order._id!.toString(), true)}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                          title="Archive order"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => onStatusChange(order._id!.toString(), e.target.value)}
                        className={`w-full sm:w-auto pl-4 pr-10 text-sm font-semibold rounded-lg border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 appearance-none h-10 ${
                          order.status === 'pending' ? 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100 focus:ring-orange-200' :
                          order.status === 'processing' ? 'bg-[#74CADC]/10 text-[#0A5565] border-[#74CADC]/30 hover:bg-[#74CADC]/20 focus:ring-[#74CADC]/20' :
                          order.status === 'ready_for_pickup' ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100 focus:ring-green-200' :
                          order.status === 'delivered' ? 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100 focus:ring-gray-200' :
                          'bg-red-50 text-red-800 border-red-300 hover:bg-red-100 focus:ring-red-200'
                        }`}
                        style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="ready_for_pickup">Ready for Pickup</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {order.status === 'processing' && (
                    <Button
                      onClick={() => onPickupReady(order)}
                      className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Mark Ready
                    </Button>
                  )}
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h4 className="font-semibold text-gray-900">Customer</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {order.customer.email}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {order.customer.phone}
                    </p>
                  </div>
                </div>

                {/* Pickup Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h4 className="font-semibold text-gray-900">Pickup</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">Pickup Only Service</p>
                    <p className="text-sm text-gray-600">Customer will be contacted for pickup arrangement</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h4 className="font-semibold text-gray-900">Payment</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 capitalize">{order.paymentMethod}</p>
                    <p className="text-sm text-gray-600">Payment completed</p>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h4 className="font-semibold text-gray-900">Order Items</h4>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-3">
                    {order.items.map((item, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.productName}
                            {item.selectedSize && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-[#74CADC] text-[#0A5565] rounded-md">
                                {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-md">
                                {item.selectedColor}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ${(item.quantity * (item.productPrice ?? 0)).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${(item.productPrice ?? 0).toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-xl py-4 px-2">
                <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">${(order.subtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">${(order.tax ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pickup</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${(order.total ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs md:text-sm text-gray-500 text-center sm:text-left">
              Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || ordersLoading}
                variant="ghost"
                className="px-2 md:px-3 py-2 text-sm"
              >
                Prev
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const page = i + 1;
                  const isActive = page === currentPage;
                  
                  return (
                    <Button
                      key={page}
                      onClick={() => onPageChange(page)}
                      disabled={ordersLoading}
                      variant={isActive ? "default" : "ghost"}
                      className={`px-2 md:px-3 py-2 text-sm ${
                        isActive 
                          ? 'bg-[#74CADC] text-[#0A5565] hover:bg-[#74CADC]/90' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || ordersLoading}
                variant="ghost"
                className="px-2 md:px-3 py-2 text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


