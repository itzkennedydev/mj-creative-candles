"use client";

import { MainNav } from "../../sca-dashboard/components/layout/main-nav";
import { AppSidebarNav } from "../../sca-dashboard/components/layout/sidebar/app-sidebar-nav";
import { HelpButton } from "../../sca-dashboard/components/layout/sidebar/help-button";
import { SettingsButton } from "../../sca-dashboard/components/layout/sidebar/settings-button";
import { PageContent } from "../../sca-dashboard/components/layout/page-content";
import { PageWidthWrapper } from "../../sca-dashboard/components/layout/page-width-wrapper";
import { useOrders } from "~/lib/hooks/use-orders";
import { useEffect, useState, useMemo } from "react";
import { Input } from "../../sca-dashboard/components/ui/input";
import { Badge } from "../../sca-dashboard/components/ui/badge";
import { Button } from "../../sca-dashboard/components/ui/button";
import { 
  RefreshCw,
  Users,
  Mail,
  Phone,
  ShoppingCart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from "lucide-react";
import { Combobox, type ComboboxOption } from "../../sca-dashboard/components/ui/combobox";
import * as Dialog from "@radix-ui/react-dialog";

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate?: string;
  country?: string;
}

export default function CustomersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [orderCountFilter, setOrderCountFilter] = useState<string>("");
  const [lifetimeValueFilter, setLifetimeValueFilter] = useState<string>("");

  // Fetch all orders to get all customers
  useEffect(() => {
    const fetchAllOrders = async () => {
      const token = sessionStorage.getItem("adminToken");
      if (!token) return;

      try {
        setIsLoading(true);
        let page = 1;
        let hasMore = true;
        const orders: any[] = [];

        while (hasMore) {
          const response = await fetch(`/api/orders?page=${page}&limit=100`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) break;

          const data = await response.json();
          if (data.orders && data.orders.length > 0) {
            orders.push(...data.orders);
            hasMore = data.orders.length === 100 && page < (data.totalPages || 1);
            page++;
          } else {
            hasMore = false;
          }
        }

        setAllOrders(orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    setIsAuthenticated(!!token);
  }, []);

  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    allOrders.forEach((order: any) => {
      const email = order.customer?.email || order.customerEmail || "unknown";
      if (email === "unknown") return; // Skip orders without customer email
      
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          firstName: order.customer?.firstName || order.customerName?.split(" ")[0] || "",
          lastName: order.customer?.lastName || order.customerName?.split(" ").slice(1).join(" ") || "",
          email: email,
          phone: order.customer?.phone || order.customerPhone,
          orderCount: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt || order.orderDate,
          country: order.shipping?.country || order.shippingAddress?.country || "US",
        });
      }
      const customer = customerMap.get(email)!;
      customer.orderCount += 1;
      customer.totalSpent += order.total || order.totalAmount || 0;
      const orderDate = order.createdAt || order.orderDate;
      if (orderDate && orderDate > (customer.lastOrderDate || "")) {
        customer.lastOrderDate = orderDate;
      }
    });

    return Array.from(customerMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );
  }, [allOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Search filter
      const matchesSearch =
        customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Order count filter
      let matchesOrderCount = true;
      if (orderCountFilter) {
        const minOrders = parseInt(orderCountFilter);
        matchesOrderCount = customer.orderCount >= minOrders;
      }

      // Lifetime value filter
      let matchesLifetimeValue = true;
      if (lifetimeValueFilter) {
        switch (lifetimeValueFilter) {
          case "very_high":
            matchesLifetimeValue = customer.totalSpent >= 750;
            break;
          case "high":
            matchesLifetimeValue = customer.totalSpent >= 300 && customer.totalSpent < 750;
            break;
          case "medium":
            matchesLifetimeValue = customer.totalSpent >= 100 && customer.totalSpent < 300;
            break;
          case "low":
            matchesLifetimeValue = customer.totalSpent < 100;
            break;
        }
      }

      return matchesSearch && matchesOrderCount && matchesLifetimeValue;
    });
  }, [customers, searchQuery, orderCountFilter, lifetimeValueFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, orderCountFilter, lifetimeValueFilter]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-500">Please login to access customers</p>
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
      <PageContent title="Customers">
        <div className="pb-10">
          <PageWidthWrapper>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">
                    View and manage customer information
                  </p>
                </div>
          <div className="flex items-center gap-2">
            <Badge variant="gray">{filteredCustomers.length} customers</Badge>
            <button
              onClick={() => {
                setIsLoading(true);
                const token = sessionStorage.getItem("adminToken");
                if (!token) return;
                
                const fetchAllOrders = async () => {
                  try {
                    let page = 1;
                    let hasMore = true;
                    const orders: any[] = [];

                    while (hasMore) {
                      const response = await fetch(`/api/orders?page=${page}&limit=100`, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });

                      if (!response.ok) break;

                      const data = await response.json();
                      if (data.orders && data.orders.length > 0) {
                        orders.push(...data.orders);
                        hasMore = data.orders.length === 100 && page < (data.totalPages || 1);
                        page++;
                      } else {
                        hasMore = false;
                      }
                    }

                    setAllOrders(orders);
                  } catch (error) {
                    console.error("Failed to fetch orders:", error);
                  } finally {
                    setIsLoading(false);
                  }
                };
                
                void fetchAllOrders();
              }}
              className="p-2 rounded-md hover:bg-neutral-100"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
            <Combobox
              options={[
                { label: "All Orders", value: "" },
                { label: "1+ Orders", value: "1" },
                { label: "5+ Orders", value: "5" },
                { label: "10+ Orders", value: "10" },
                { label: "20+ Orders", value: "20" },
              ]}
              selected={orderCountFilter ? { 
                label: `${orderCountFilter}+ Orders`, 
                value: orderCountFilter 
              } : null}
              setSelected={(option: ComboboxOption | null) => setOrderCountFilter(option?.value || "")}
              placeholder="Order Count"
              icon={ShoppingCart}
              buttonProps={{ className: "w-full md:w-fit" }}
            />
            <Combobox
              options={[
                { label: "All Values", value: "" },
                { label: "Very High Value ($750+)", value: "very_high" },
                { label: "High Value ($300-$749)", value: "high" },
                { label: "Medium Value ($100-$299)", value: "medium" },
                { label: "Low Value (<$100)", value: "low" },
              ]}
              selected={lifetimeValueFilter ? { 
                label: lifetimeValueFilter === "very_high" ? "Very High Value ($750+)" :
                       lifetimeValueFilter === "high" ? "High Value ($300-$749)" : 
                       lifetimeValueFilter === "medium" ? "Medium Value ($100-$299)" : 
                       "Low Value (<$100)", 
                value: lifetimeValueFilter 
              } : null}
              setSelected={(option: ComboboxOption | null) => setLifetimeValueFilter(option?.value || "")}
              placeholder="Lifetime Value"
              icon={ListFilter}
              buttonProps={{ className: "w-full md:w-fit" }}
            />
          </div>
          <div className="relative w-full md:w-fit md:ml-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg height="18" width="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" fill="none">
                <g fill="currentColor">
                  <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" x1="15.25" x2="11.285" y1="15.25" y2="11.285" />
                  <circle cx="7.75" cy="7.75" fill="none" r="5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </g>
              </svg>
            </div>
            <Input
              className="peer w-full rounded-md border border-neutral-200 px-10 text-black outline-none placeholder:text-neutral-400 sm:text-sm transition-all focus:border-neutral-500 focus:ring-4 focus:ring-neutral-200 md:w-[16rem]"
              placeholder="Search by email or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoCapitalize="none"
              type="text"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No customers found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Lifetime Value</th>
                    <th className="text-left py-3 px-4 font-medium">Last Order</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.map((customer, idx) => {
                    const avatarUrl = `https://avatar.vercel.sh/${customer.email}`;
                    
                    const handleEmailClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (customer.email) {
                        window.location.href = `mailto:${customer.email}`;
                      }
                    };

                    const handlePhoneClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (customer.phone) {
                        window.location.href = `tel:${customer.phone}`;
                      }
                    };

                    const handleSMSClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (customer.phone) {
                        window.location.href = `sms:${customer.phone}`;
                      }
                    };
                    
                    return (
                      <tr 
                        key={idx} 
                        className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedCustomer(customer);
                        }}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatarUrl}
                              alt={`${customer.firstName} ${customer.lastName}`}
                              className="h-8 w-8 rounded-full shrink-0"
                            />
                            <div>
                              <div className="font-medium">
                                {customer.firstName} {customer.lastName}
                              </div>
                              <div className="text-sm text-neutral-500">
                                {customer.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(customer.totalSpent)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatDate(customer.lastOrderDate)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {customer.email && (
                              <button
                                onClick={handleEmailClick}
                                title="Send Email"
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-neutral-600 hover:bg-neutral-100 transition-colors"
                              >
                                <Mail className="h-4 w-4" />
                              </button>
                            )}
                            {customer.phone && (
                              <>
                                <button
                                  onClick={handlePhoneClick}
                                  title="Call"
                                  className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-neutral-600 hover:bg-neutral-100 transition-colors"
                                >
                                  <Phone className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={handleSMSClick}
                                  title="Send SMS"
                                  className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-neutral-600 hover:bg-neutral-100 transition-colors"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredCustomers.length > pageSize && (
          <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
            <div>
              <span className="text-sm text-neutral-500">
                Showing{" "}
                <span className="font-medium text-neutral-900">
                  {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-neutral-900">
                  {filteredCustomers.length}
                </span>{" "}
                customers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3"
                icon={<ChevronLeft className="h-4 w-4" />}
                text="Previous"
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 min-w-[32px] px-2 text-sm rounded-md transition-colors ${
                        currentPage === pageNum
                          ? "bg-neutral-900 text-white"
                          : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3"
                text="Next"
                right={<ChevronRight className="h-4 w-4" />}
              />
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Dialog */}
      <Dialog.Root open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            {selectedCustomer && (
              <>
                <Dialog.Title className="text-xl font-semibold mb-4">
                  Customer Details
                </Dialog.Title>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Contact Information</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-neutral-400" />
                        <span>
                          {selectedCustomer.firstName} {selectedCustomer.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                      {selectedCustomer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-neutral-400" />
                          <span>{selectedCustomer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Order Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-neutral-500">Total Orders</div>
                        <div className="text-lg font-semibold">{selectedCustomer.orderCount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-500">Total Spent</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(selectedCustomer.totalSpent)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Dialog.Close asChild>
                  <button className="mt-6 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-md text-sm">
                    Close
                  </button>
                </Dialog.Close>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
          </PageWidthWrapper>
        </div>
      </PageContent>
    </MainNav>
  );
}

