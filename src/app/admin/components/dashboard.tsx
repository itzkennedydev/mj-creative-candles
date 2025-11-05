"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { 
  Settings, 
  Package, 
  Clock, 
  CheckCircle, 
  Eye, 
  Plus, 
  Activity,
  DollarSign
} from "lucide-react";
import type { Order } from "~/lib/order-types";

interface DashboardProps {
  orders: Order[];
  ordersLoading: boolean;
  totalOrders: number;
  onRefetchOrders: () => void;
  onViewOrder: (order: Order) => void;
  onSetActiveSection: (section: string) => void;
}

export function Dashboard({
  orders,
  ordersLoading,
  totalOrders,
  onRefetchOrders,
  onViewOrder,
  onSetActiveSection
}: DashboardProps) {
  const getOrderStats = () => {
    const totalOrdersCount = totalOrders;
    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
    const processingOrdersCount = orders.filter(o => o.status === 'processing').length;
    const readyOrdersCount = orders.filter(o => o.status === 'ready_for_pickup').length;
    const totalRevenueAmount = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);
    
    return {
      totalOrders: totalOrdersCount,
      pendingOrders: pendingOrdersCount,
      processingOrders: processingOrdersCount,
      readyOrders: readyOrdersCount,
      totalRevenue: totalRevenueAmount
    };
  };

  const stats = getOrderStats();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={onRefetchOrders}
            disabled={ordersLoading}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Total Orders */}
        <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out group">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Package className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
            </div>
            <div className="text-right">
              <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
              <p className="text-xs text-gray-500">Total Orders</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-gray-600">All time</span>
            <div className="flex items-center text-gray-600 text-xs md:text-sm">
              <Activity className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Active</span>
            </div>
          </div>
        </div>
        
        {/* Pending Orders */}
        <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out group">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
            </div>
            <div className="text-right">
              <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.pendingOrders}</div>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-gray-600">Awaiting processing</span>
            {stats.pendingOrders > 0 && (
              <div className="flex items-center text-gray-700 text-xs md:text-sm">
                <Clock className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Action needed</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Processing Orders */}
        <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out group">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Activity className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
            </div>
            <div className="text-right">
              <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.processingOrders}</div>
              <p className="text-xs text-gray-500">Processing</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-gray-600">In progress</span>
            <div className="flex items-center text-gray-600 text-xs md:text-sm">
              <Activity className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Working</span>
            </div>
          </div>
        </div>
        
        {/* Ready for Pickup */}
        <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out group">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
            </div>
            <div className="text-right">
              <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.readyOrders}</div>
              <p className="text-xs text-gray-500">Ready</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-gray-600">Awaiting pickup</span>
            {stats.readyOrders > 0 && (
              <div className="flex items-center text-gray-700 text-xs md:text-sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue Card */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
          {/* Mobile-First Layout */}
          <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
            {/* Revenue Stats */}
            <div className="space-y-6 md:flex md:flex-col md:justify-between md:h-full md:min-h-[200px]">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center">
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Revenue Overview</h2>
                  <p className="text-xs md:text-sm text-gray-600">Total revenue from all orders</p>
                </div>
              </div>
              
              <div className="text-left py-4">
                <div className="text-4xl md:text-5xl font-bold text-green-600">
                  ${(stats.totalRevenue ?? 0).toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-3 hidden md:block">
                <div className="text-sm text-gray-600">From {stats.totalOrders} orders</div>
                <div className="text-sm text-gray-500">Average: ${stats.totalOrders > 0 ? ((stats.totalRevenue ?? 0) / stats.totalOrders).toFixed(2) : '0.00'}</div>
              </div>
            </div>
            
            {/* Functional Chart */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 font-medium">Revenue Trend</div>
                <div className="text-xs text-gray-400">
                  {orders.length > 0 ? `Last ${Math.min(7, orders.length)} orders` : 'No data'}
                </div>
              </div>
              
              {orders.length > 0 ? (
                <div className="space-y-3">
                  {/* Chart Bars */}
                  <div className="flex items-end justify-between space-x-2 h-20 border-b border-gray-100 pb-2">
                    {orders.slice(0, 7).map((order, i) => {
                      const orderTotal = order.total ?? 0;
                      const maxOrderTotal = Math.max(...orders.map(o => o.total ?? 0));
                      const height = maxOrderTotal > 0 ? (orderTotal / maxOrderTotal) * 50 + 10 : 10; // 10-60px range
                      const isHighest = orderTotal === maxOrderTotal && maxOrderTotal > 0;
                      
                      return (
                        <div key={order._id?.toString() ?? i} className="flex flex-col items-center flex-1">
                          <div
                            className={`w-full rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer ${
                              isHighest ? 'bg-[#74CADC]' : 'bg-gray-300'
                            }`}
                            style={{ height: `${height}px` }}
                            title={`Order #${order.orderNumber}: $${orderTotal.toFixed(2)}`}
                          />
                          <div className="text-xs text-gray-500 mt-1 font-medium">
                            ${orderTotal.toFixed(0)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Chart Legend */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#74CADC] rounded-full"></div>
                      <span>Highest Order</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Other Orders</span>
                    </div>
                  </div>
                  
                  {/* Order Details */}
                  <div className="space-y-1">
                    {orders.slice(0, 3).map((order, i) => (
                      <div key={order._id?.toString() ?? i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Order #{order.orderNumber}</span>
                        <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="font-medium text-gray-900">${(order.total ?? 0).toFixed(2)}</span>
                      </div>
                    ))}
                    {orders.length > 3 && (
                      <div className="text-xs text-gray-400 text-center pt-1">
                        +{orders.length - 3} more orders
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-1">No orders yet</div>
                    <div className="text-xs text-gray-400">Start selling to see revenue trends</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common tasks</p>
            </div>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={() => onSetActiveSection("products")}
              className="w-full justify-start bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
            <Button 
              variant="outline"
              onClick={() => onSetActiveSection("orders")}
              className="w-full justify-start"
            >
              <Package className="h-4 w-4 mr-2" />
              View All Orders
            </Button>
            <Button 
              variant="outline"
              onClick={() => onSetActiveSection("settings")}
              className="w-full justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Store Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-600">Latest orders requiring attention</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSetActiveSection("orders")}
            className="flex items-center gap-2"
          >
            View All
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        
        {ordersLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-4">Orders will appear here once customers start placing them.</p>
            <Button 
              onClick={() => onSetActiveSection("products")}
              className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id?.toString() ?? order.orderNumber} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      order.status === 'processing' ? 'bg-[#74CADC]/20 text-[#0A5565]' :
                      order.status === 'ready_for_pickup' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{order.customer.firstName} {order.customer.lastName}</span>
                    <span>•</span>
                    <span className="font-semibold text-gray-900">${(order.total ?? 0).toFixed(2)}</span>
                    <span>•</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewOrder(order)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

