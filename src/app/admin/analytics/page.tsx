"use client";

import { MainNav } from "../../sca-dashboard/components/layout/main-nav";
import { AppSidebarNav } from "../../sca-dashboard/components/layout/sidebar/app-sidebar-nav";
import { HelpButton } from "../../sca-dashboard/components/layout/sidebar/help-button";
import { SettingsButton } from "../../sca-dashboard/components/layout/sidebar/settings-button";
import { PageContent } from "../../sca-dashboard/components/layout/page-content";
import { PageWidthWrapper } from "../../sca-dashboard/components/layout/page-width-wrapper";
import { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import { 
  ShoppingCart,
  Users,
  RefreshCw,
  BarChart3,
  MoreVertical,
  MapPin,
  Building2,
  Map as MapIcon,
  Package,
  CreditCard,
  Search,
} from "lucide-react";
import { DateRangePicker } from "../../sca-dashboard/components/ui/date-picker";
import type { DateRangePreset } from "../../sca-dashboard/components/ui/date-picker/types";
import { FilterSelect } from "../../sca-dashboard/components/ui/filter/filter-select";
import { FilterList } from "../../sca-dashboard/components/ui/filter/filter-list";
import type { FilterOption } from "../../sca-dashboard/components/ui/filter/types";
import { Button } from "../../sca-dashboard/components/ui/button";
import { Input } from "../../sca-dashboard/components/ui/input";
import { subHours, subDays, subMonths, startOfDay, endOfDay, startOfMonth, startOfQuarter, startOfYear } from "date-fns";
import { TimeSeriesChart, XAxis, YAxis } from "../../sca-dashboard/components/ui/charts";
import { useChartContext, useChartTooltipContext } from "../../sca-dashboard/components/ui/charts/chart-context";
import { Group } from "@visx/group";
import { Line, Area, AreaClosed, Circle } from "@visx/shape";
import { LinearGradient } from "@visx/gradient";
import { cn } from "../../sca-dashboard/utils";
import type { TimeSeriesDatum } from "../../sca-dashboard/components/ui/charts/types";

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalCustomers: number;
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
  filterOptions?: {
    countries: string[];
    cities: string[];
    states: string[];
    paymentMethods: string[];
    orderStatuses: string[];
    customers: string[];
  };
  recentOrders?: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: string;
    createdAt: Date | string;
    itemCount: number;
    items: Array<{
      productName: string;
      quantity: number;
      productPrice: number;
      selectedSize?: string;
      selectedColor?: string;
    }>;
  }>;
}

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined } | undefined>({
    from: undefined,
    to: undefined,
  });
  const [selectedPresetId, setSelectedPresetId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"orders" | "avgOrderValue" | "sales">("orders");
  const [productsTab, setProductsTab] = useState<"topProducts" | "orders">("orders");
  const [searchQuery, setSearchQuery] = useState("");
  type FilterValue = string | number | boolean;
  const [activeFilters, setActiveFilters] = useState<Array<{ key: string; value: FilterValue | FilterValue[] }>>([]);
  
  // Debounce refs for rate limiting
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);

  // Date range presets
  const datePresets: DateRangePreset[] = useMemo(() => [
    {
      id: "24h",
      label: "Last 24 hours",
      shortcut: "d",
      dateRange: {
        from: startOfDay(subHours(new Date(), 24)),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "7d",
      label: "Last 7 days",
      shortcut: "w",
      dateRange: {
        from: startOfDay(subDays(new Date(), 7)),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "30d",
      label: "Last 30 days",
      shortcut: "t",
      dateRange: {
        from: startOfDay(subDays(new Date(), 30)),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "90d",
      label: "Last 3 months",
      shortcut: "3",
      dateRange: {
        from: startOfDay(subMonths(new Date(), 3)),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "1y",
      label: "Last 12 months",
      shortcut: "y",
      dateRange: {
        from: startOfDay(subMonths(new Date(), 12)),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "mtd",
      label: "Month to Date",
      shortcut: "m",
      dateRange: {
        from: startOfMonth(new Date()),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "qtd",
      label: "Quarter to Date",
      shortcut: "q",
      dateRange: {
        from: startOfQuarter(new Date()),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "ytd",
      label: "Year to Date",
      shortcut: "r",
      dateRange: {
        from: startOfYear(new Date()),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "all",
      label: "All Time",
      shortcut: "a",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    },
  ], []);

  // Helper function to get country code for flag icon
  const getCountryCode = (countryName: string): string | null => {
    const countryCodeMap: Record<string, string> = {
      "United States": "us",
      "Canada": "ca",
      "United Kingdom": "gb",
      "Australia": "au",
      "Germany": "de",
      "France": "fr",
      "US": "us",
      "USA": "us",
      "CA": "ca",
      "UK": "gb",
      "GB": "gb",
      "AU": "au",
      "DE": "de",
      "FR": "fr",
    };
    return countryCodeMap[countryName]?.toLowerCase() ?? null;
  };

  // Filter definitions - relevant to e-commerce/orders analytics
  const filters = useMemo(() => {
    // Get dynamic options from analytics data
    const productOptions = analytics?.topProducts?.map(product => ({
      value: product.name,
      label: product.name,
    })) ?? [];

    // Get filter options from API response
    const filterOptions = analytics?.filterOptions;
    
    // Order status options - only show what exists in data
    const orderStatusOptions = filterOptions?.orderStatuses?.map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
    })) ?? [];

    // Payment method options - only show what exists in data
    const paymentMethodOptions = filterOptions?.paymentMethods?.map(method => ({
      value: method,
      label: method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, ' '),
    })) ?? [];

    // Country options - only show what exists in data
    const countryOptions = filterOptions?.countries?.map(country => {
      const code = getCountryCode(country);
      return {
        value: country,
        label: country,
        ...(code && { icon: <img alt={code.toUpperCase()} className="size-4 shrink-0" src={`https://hatscripts.github.io/circle-flags/flags/${code}.svg`} /> }),
      };
    }) ?? [];

    // City options - only show what exists in data
    const cityOptions = filterOptions?.cities?.map(city => ({
      value: city,
      label: city,
    })) ?? [];

    // State/Region options - only show what exists in data
    const stateOptions = filterOptions?.states?.map(state => ({
      value: state,
      label: state,
    })) ?? [];

    // Customer options - limit to top customers or all if available
    const customerOptions = filterOptions?.customers?.slice(0, 50).map(email => ({
      value: email,
      label: email,
    })) ?? [];

    return [
      {
        key: "orderStatus",
        icon: ShoppingCart,
        label: "Order Status",
        options: orderStatusOptions.length > 0 ? orderStatusOptions : [],
        multiple: true,
        separatorAfter: true,
      },
      {
        key: "product",
        icon: Package,
        label: "Product",
        options: productOptions.length > 0 ? productOptions : [],
        multiple: true,
      },
      {
        key: "customer",
        icon: Users,
        label: "Customer",
        options: customerOptions.length > 0 ? customerOptions : [],
        multiple: true,
      },
      {
        key: "paymentMethod",
        icon: CreditCard,
        label: "Payment Method",
        options: paymentMethodOptions.length > 0 ? paymentMethodOptions : [],
        multiple: true,
        separatorAfter: true,
      },
      {
        key: "country",
        icon: MapPin,
        label: "Country",
        options: countryOptions,
        multiple: true,
        getOptionIcon: (value: FilterOption["value"], props: { key: string; option?: FilterOption }) => {
          // Return the icon from the option if it exists
          if (props.option?.icon) {
            return props.option.icon;
          }
          // Map country names to country codes for flag URLs
          const code = getCountryCode(String(value));
          if (code) {
            return <img alt={code.toUpperCase()} className="size-4 shrink-0" src={`https://hatscripts.github.io/circle-flags/flags/${code}.svg`} />;
          }
          return null;
        },
      },
      {
        key: "city",
        icon: Building2,
        label: "City",
        options: cityOptions,
        multiple: true,
      },
      {
        key: "region",
        icon: MapIcon,
        label: "State/Region",
        options: stateOptions,
        multiple: true,
      },
    ];
  }, [analytics]);

  // Map date range to API values and determine groupBy
  const getApiParams = useCallback(() => {
    if (!dateRange?.from) {
      return { period: "all", groupBy: "month" };
    }

    const daysDiff = dateRange.to 
      ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    let apiPeriod = "all";
    let groupBy = "day";

    if (daysDiff <= 1) {
      apiPeriod = "week";
      groupBy = "hour";
    } else if (daysDiff <= 7) {
      apiPeriod = "week";
      groupBy = "day";
    } else if (daysDiff <= 30) {
      apiPeriod = "month";
      groupBy = "day";
    } else if (daysDiff <= 90) {
      apiPeriod = "year";
      groupBy = "week";
    } else {
      apiPeriod = "all";
      groupBy = "month";
    }

    return { period: apiPeriod, groupBy };
  }, [dateRange]);

  const fetchAnalytics = useCallback(async (immediate = false) => {
    // Clear any pending timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    // Debounce: wait 300ms before fetching (unless immediate)
    const fetchFn = async () => {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      
      // Rate limiting: ensure at least 500ms between requests
      if (timeSinceLastFetch < 500 && !immediate) {
        fetchTimeoutRef.current = setTimeout(() => {
          void fetchFn();
        }, 500 - timeSinceLastFetch);
        return;
      }

      setIsLoading(true);
      try {
      const token = sessionStorage.getItem("adminToken");
      if (!token) return;
      const { period, groupBy } = getApiParams();
      
      // Build filter query parameters
      const filterParams = new URLSearchParams();
      activeFilters.forEach((filter) => {
        if (Array.isArray(filter.value)) {
            filter.value.forEach((val: FilterValue) => {
            filterParams.append(filter.key, String(val));
          });
        } else {
          filterParams.append(filter.key, String(filter.value));
        }
      });
      
      // Add date range parameters
      const dateParams = new URLSearchParams();
      if (dateRange?.from) {
        dateParams.append('from', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        dateParams.append('to', dateRange.to.toISOString());
      }
      
      const queryString = filterParams.toString();
      const dateString = dateParams.toString();
      const url = `/api/orders/analytics?period=${period}&groupBy=${groupBy}${dateString ? `&${dateString}` : ''}${queryString ? `&${queryString}` : ''}`;
      
      console.log('Fetching analytics with filters:', { activeFilters, url, queryString });
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
        
      if (response.ok) {
          const data = await response.json() as AnalyticsData;
        setAnalytics(data);
          lastFetchTimeRef.current = Date.now();
          retryCountRef.current = 0; // Reset retry count on success
        } else if (response.status === 429) {
          // Rate limited - implement exponential backoff
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter 
            ? parseInt(retryAfter, 10) * 1000 
            : Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          
          retryCountRef.current += 1;
          console.warn(`Rate limited. Retrying after ${waitTime}ms (attempt ${retryCountRef.current})`);
          
          fetchTimeoutRef.current = setTimeout(() => {
            void fetchAnalytics(true);
          }, waitTime);
      } else {
        console.error('Failed to fetch analytics:', response.status, response.statusText);
          retryCountRef.current = 0;
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
        retryCountRef.current = 0;
    } finally {
      setIsLoading(false);
      }
    };

    if (immediate) {
      void fetchFn();
    } else {
      fetchTimeoutRef.current = setTimeout(() => {
        void fetchFn();
      }, 300);
    }
  }, [getApiParams, activeFilters, dateRange]);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    setIsAuthenticated(!!token);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Debug: Log activeFilters changes
  useEffect(() => {
    console.log('activeFilters changed:', activeFilters);
  }, [activeFilters]);

  // Fetch analytics when date range or filters change
  useEffect(() => {
    if (isAuthenticated) {
      console.log('useEffect triggered - fetching analytics with:', { dateRange, activeFilters });
      void fetchAnalytics();
    }
  }, [dateRange, activeFilters, isAuthenticated, fetchAnalytics]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }, []);

  // Transform revenueOverTime data into chart format - memoized to prevent recalculation
  const chartData: TimeSeriesDatum<{ orders: number; revenue: number; avgOrderValue: number }>[] = useMemo(() => {
    if (!analytics?.revenueOverTime) return [];
    
    const dataPoints = analytics.revenueOverTime
      .map((item) => {
        // Parse the _id to get a date
        let date: Date;
        if (typeof item._id === "object") {
          // If it's an object with year, month, day, etc.
          const id = item._id;
          const year = id.year ?? new Date().getFullYear();
          const month = (id.month ?? 1) - 1; // JavaScript months are 0-indexed
          const day = id.day ?? 1;
          const hour = id.hour ?? 0;
          date = new Date(year, month, day, hour);
        } else {
          // If it's a number, treat it as a timestamp or day index
          date = new Date(Number(item._id));
        }
        
        return {
          date,
          values: {
            orders: item.orderCount ?? 0,
            revenue: item.revenue ?? 0,
            avgOrderValue: item.orderCount > 0 ? item.revenue / item.orderCount : 0,
          },
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date

    // If we have a dateRange, fill in missing days with zero values to ensure proper visualization
    if (dateRange?.from && dateRange?.to && dataPoints.length > 0) {
      const filledData: TimeSeriesDatum<{ orders: number; revenue: number; avgOrderValue: number }>[] = [];
      
      // Create a map of existing data points by date string (YYYY-MM-DD) for day-level grouping
      const dataMap = new Map<string, typeof dataPoints[0]>();
      dataPoints.forEach(point => {
        const dateStr: string = point.date.toISOString().split('T')[0]!; // YYYY-MM-DD - split always returns at least one element
        // If multiple points exist for the same day, keep the one with data (non-zero)
        if (!dataMap.has(dateStr) || (point.values.orders > 0 || point.values.revenue > 0)) {
          dataMap.set(dateStr, point);
        }
      });

      // Determine the grouping interval based on date range
      if (dateRange.from && dateRange.to) {
      const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      const isHourly = daysDiff <= 1;
      const intervalMs = isHourly ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 1 hour or 1 day

      // Fill in missing intervals with zero values
      let currentDate = new Date(dateRange.from);
      // Normalize to start of day
      currentDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(dateRange.to);
      endDate.setHours(23, 59, 59, 999);

      while (currentDate <= endDate) {
          const dateStr: string = currentDate.toISOString().split('T')[0]!; // split always returns at least one element
        
          const existingPoint = dataMap.get(dateStr);
          if (existingPoint) {
          // Use existing data point
            filledData.push(existingPoint);
        } else {
          // Create zero-value data point for missing day
          filledData.push({
            date: new Date(currentDate),
            values: {
              orders: 0,
              revenue: 0,
              avgOrderValue: 0,
            },
          });
        }

        // Move to next interval
        currentDate = new Date(currentDate.getTime() + intervalMs);
        }
      }

      return filledData;
    }

    return dataPoints;
  }, [analytics?.revenueOverTime, dateRange]);

  // Define all chart series with stable function references - memoize once
  const ordersAccessor = useCallback((d: TimeSeriesDatum<{ orders: number; revenue: number; avgOrderValue: number }>) => d.values.orders, []);
  const avgOrderValueAccessor = useCallback((d: TimeSeriesDatum<{ orders: number; revenue: number; avgOrderValue: number }>) => d.values.avgOrderValue, []);
  const salesAccessor = useCallback((d: TimeSeriesDatum<{ orders: number; revenue: number; avgOrderValue: number }>) => d.values.revenue, []);

  // Memoize filter handlers to prevent FilterSelect from resetting
  const handleFilterSelect = useCallback((key: string, value: FilterOption["value"]) => {
    // Type guard to ensure value is a valid FilterValue
    const typedValue = (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') 
      ? value as FilterValue 
      : String(value) as FilterValue;
    console.log('handleFilterSelect called:', { key, value: typedValue });
    if (key === "ai") {
      // Handle AI filter
      return;
    }
    
    setActiveFilters((prev) => {
      console.log('Current activeFilters before update:', prev);
      // Find filter definition - use a stable reference
      const filter = filters.find((f) => f.key === key);
      if (!filter) {
        console.warn(`Filter with key "${key}" not found in filters:`, filters.map(f => f.key));
        return prev; // Return previous state if filter not found
      }
      
      const existing = prev.find((f) => f.key === key);
      let newFilters: Array<{ key: string; value: FilterValue | FilterValue[] }>;
      
      if (existing) {
        // Handle multiple selections
        if (filter.multiple && Array.isArray(existing.value)) {
          if (existing.value.includes(typedValue)) {
            // Remove if already selected
            newFilters = prev.map((f) => 
              f.key === key 
                ? { key, value: (existing.value as FilterValue[]).filter((v: FilterValue) => v !== typedValue) }
                : f
            ).filter((f) => !(f.key === key && Array.isArray(f.value) && f.value.length === 0));
          } else {
            // Add to array
            newFilters = prev.map((f) => 
              f.key === key 
                ? { key, value: [...(existing.value as FilterValue[]), typedValue] }
                : f
            );
          }
        } else {
          // Single selection - replace
          newFilters = prev.map((f) => f.key === key ? { key, value: typedValue } : f);
        }
      } else {
        // New filter - add as array if multiple, single value otherwise
        newFilters = [...prev, { 
          key, 
          value: filter.multiple ? [typedValue] : typedValue
        }];
      }
      
      console.log('Setting activeFilters:', { key, value: typedValue, prev, newFilters });
      return newFilters;
    });
  }, [filters]);

  const handleFilterRemove = useCallback((key: string, value: FilterOption["value"]) => {
    // Type guard to ensure value is a valid FilterValue
    const typedValue = (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') 
      ? value as FilterValue 
      : String(value) as FilterValue;
    setActiveFilters((prev) => {
      const existing = prev.find((f) => f.key === key);
      if (existing && Array.isArray(existing.value)) {
        // Remove value from array
        const newValue = existing.value.filter((v: FilterValue) => v !== typedValue);
        if (newValue.length === 0) {
          // Remove filter if no values left
          return prev.filter((f) => f.key !== key);
        }
        return prev.map((f) => 
          f.key === key ? { key, value: newValue } : f
        );
      } else {
        // Single value - remove entire filter
        return prev.filter((f) => !(f.key === key && f.value === typedValue));
      }
    });
  }, []);

  // Stable series base - never changes
  const seriesBase = useMemo(() => [
    {
      id: "orders",
      valueAccessor: ordersAccessor,
      colorClassName: "text-blue-500",
    },
    {
      id: "avgOrderValue",
      valueAccessor: avgOrderValueAccessor,
      colorClassName: "text-violet-600",
    },
    {
      id: "sales",
      valueAccessor: salesAccessor,
      colorClassName: "text-teal-400",
    },
  ], [ordersAccessor, avgOrderValueAccessor, salesAccessor]);

  // Create series array - only isActive changes, everything else is stable
  // Use ref to maintain stable reference and only update isActive
  const chartSeries = useMemo(() => 
    seriesBase.map(s => ({
      ...s,
      isActive: s.id === activeTab,
    }))
  , [seriesBase, activeTab]);

  const getTooltipContent = useCallback((d: TimeSeriesDatum<{ orders: number; revenue: number; avgOrderValue: number }>) => {
    if (activeTab === "orders") {
      return `${d.values.orders} orders`;
    }
    if (activeTab === "sales") {
      return formatCurrency(d.values.revenue);
    }
    return formatCurrency(d.values.avgOrderValue);
  }, [activeTab, formatCurrency]);

  // Memoize Y-axis tick format to prevent recalculation
  const yAxisTickFormat = useCallback((value: number) => {
    if (activeTab === "sales" || activeTab === "avgOrderValue") {
      return formatCurrency(value);
    }
    return value.toString();
  }, [activeTab, formatCurrency]);

  // Memoize series styles for all series - render all at once
  const seriesStyles = useMemo(() => [
    {
      id: "orders",
      gradientClassName: "text-blue-500",
      lineClassName: "text-blue-500",
    },
    {
      id: "avgOrderValue",
      gradientClassName: "text-violet-600",
      lineClassName: "text-violet-600",
    },
    {
      id: "sales",
      gradientClassName: "text-teal-400",
      lineClassName: "text-teal-400",
    },
  ], []);

  // Component to render horizontal reference line at middle of chart area
  function HorizontalReferenceLine() {
    const { margin, width, height } = useChartContext();
    // Draw line at middle of chart area height (matching reference SVG)
    const y = height / 2;
    
    return (
      <Group left={margin.left} top={margin.top}>
        <Line
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#00000026"
          strokeWidth={1}
          strokeDasharray="5"
        />
      </Group>
    );
  }

  // Optimized Areas component that renders all series with instant visibility toggle
  // Use memo to prevent re-renders when only activeTab changes
  const OptimizedAreas = memo(function OptimizedAreas() {
    const { data, series, margin, xScale, yScale } = useChartContext();
    const { tooltipData } = useChartTooltipContext();
    
    return (
      <>
        {/* Define gradients once */}
        <defs>
          {series.map((s) => (
            <LinearGradient
              key={`${s.id}-gradient`}
              id={`${s.id}-mask-gradient`}
              from="white"
              to="white"
              fromOpacity={0.2}
              toOpacity={0}
              x1={0}
              x2={0}
              y1={0}
              y2={1}
            />
          ))}
        </defs>
        <Group left={margin.left} top={margin.top}>
          {series.map((s) => {
            const isActive = s.isActive !== false;
            const seriesStyle = seriesStyles.find(({ id }) => id === s.id);
            
            return (
              <g
                key={s.id}
                style={{ 
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? 'auto' : 'none',
                  transition: 'none', // Disable all transitions for instant switching
                }}
              >
                <mask id={`${s.id}-mask`} maskContentUnits="objectBoundingBox">
                  <rect width="1" height="1" fill={`url(#${s.id}-mask-gradient)`} />
                </mask>

                {/* Area - render without animations for instant switching */}
                <AreaClosed
                  data={data}
                  x={(d) => xScale(d.date) ?? 0}
                  y={(d) => yScale(s.valueAccessor(d) ?? 0)}
                  yScale={yScale}
                >
                  {({ path }) => (
                    <path
                      d={path(data) ?? ""}
                      className={cn(
                        s.colorClassName ?? "text-blue-500",
                        seriesStyle?.gradientClassName,
                      )}
                      mask={`url(#${s.id}-mask)`}
                      fill="currentColor"
                    />
                  )}
                </AreaClosed>

                {/* Line */}
                <Area
                  data={data}
                  x={(d) => xScale(d.date) ?? 0}
                  y={(d) => yScale(s.valueAccessor(d) ?? 0)}
                >
                  {({ path }) => (
                    <path
                      d={path(data) ?? ""}
                      className={cn(
                        s.colorClassName ?? "text-blue-700",
                        seriesStyle?.lineClassName,
                      )}
                      stroke="currentColor"
                      strokeOpacity={0.8}
                      strokeWidth={2}
                      fill="transparent"
                    />
                  )}
                </Area>

                {/* Latest value circle */}
                {isActive && !tooltipData && data.length > 0 && (() => {
                  const lastDataPoint = data[data.length - 1];
                  if (!lastDataPoint) return null;
                  return (
                    <Circle
                      cx={xScale(lastDataPoint.date) ?? 0}
                      cy={yScale(s.valueAccessor(lastDataPoint) ?? 0)}
                    r={4}
                    className={cn(
                      s.colorClassName ?? "text-blue-700",
                      seriesStyle?.lineClassName,
                    )}
                      fill="currentColor"
                    />
                  );
                })()}
              </g>
            );
          })}
        </Group>
      </>
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-500">Please login to access analytics</p>
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
      <PageContent title="Analytics">
        <div className="pb-10">
          {/* Filter Controls Section */}
            <div className="py-3 md:py-3 pt-0 md:pt-0">
            <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-2 px-3 lg:px-6">
              <div className="flex w-full items-center justify-between gap-2 flex-col md:flex-row">
                <div className="flex w-full flex-col-reverse items-center gap-2 min-[550px]:flex-row">
                  <FilterSelect
                    filters={filters}
                    activeFilters={activeFilters}
                    onSelect={handleFilterSelect}
                    onRemove={handleFilterRemove}
                    askAI={true}
                    className="w-full md:w-fit"
                  >
                    Filter
                  </FilterSelect>
                  <div className="flex w-full grow items-center gap-2 md:w-auto">
                  <DateRangePicker
                    value={dateRange}
                    onChange={(range, preset) => {
                      setDateRange(range);
                      if (preset) {
                        setSelectedPresetId(preset.id);
                      }
                    }}
                    presets={datePresets}
                    presetId={selectedPresetId}
                    placeholder="Select period"
                    className="w-full sm:min-w-[160px] md:w-fit lg:min-w-[200px]"
                  />
                  <div className="relative w-full sm:min-w-[200px] md:w-fit lg:min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      type="text"
                      placeholder="Search orders, products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full"
                    />
                </div>
                <div className="flex grow justify-end gap-2">
                  <Button
                    variant="outline"
                        onClick={() => fetchAnalytics(true)}
                    className="w-fit"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    className="px-1.5"
                  >
                    <MoreVertical className="h-5 w-5 text-neutral-500" />
                  </Button>
                </div>
              </div>
            </div>
              </div>
            </div>
          </div>

          {/* Active Filters Section - Match exact structure from example */}
          <div className="mx-auto w-full max-w-screen-xl px-3 lg:px-6">
            <FilterList
              filters={filters}
              activeFilters={activeFilters}
              onRemove={handleFilterRemove}
              onRemoveAll={() => {
                setActiveFilters([]);
              }}
              onSelect={handleFilterSelect}
            />
          </div>

          {/* Main Chart Area */}
          <div className="mx-auto grid max-w-screen-xl gap-5 px-3 lg:px-6">
            <div className="w-full overflow-hidden bg-white">
              <div className="border border-neutral-200 sm:rounded-t-xl">
                {/* Tabs */}
                <div className="grid w-full grid-cols-3 divide-x divide-neutral-200 overflow-y-hidden">
                  <div className="relative z-0 w-full">
                  <button
                    onClick={() => setActiveTab("orders")}
                      className={`relative z-0 border-box block h-full w-full px-4 py-3 sm:px-8 sm:py-6 transition-colors duration-75 hover:bg-neutral-50 focus:outline-none active:bg-neutral-100 ring-inset ring-neutral-500 focus-visible:ring-1 sm:first:rounded-tl-xl ${
                      activeTab === "orders" ? "" : ""
                    }`}
                  >
                    <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-black transition-transform duration-75 ease-in-out ${
                      activeTab === "orders" ? "translate-y-0" : "translate-y-[3px]"
                    }`}></div>
                    <div className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <div className="h-2 w-2 rounded-sm bg-current shadow-[inset_0_0_0_1px_#00000019] text-blue-500/50"></div>
                      <span>Orders</span>
                    </div>
                    <div className="mt-1 flex h-12 items-center">
                      <span className="text-xl font-medium sm:text-3xl">
                        {analytics ? analytics.summary.totalOrders : 0}
                      </span>
                    </div>
                  </button>
                  </div>
                  
                  <div className="relative z-0 w-full">
                    <div className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-1.5">
                      <BarChart3 className="h-3 w-3 text-neutral-400" />
                    </div>
                    <button
                      onClick={() => setActiveTab("avgOrderValue")}
                      className={`border-box relative block h-full w-full px-4 py-3 sm:px-8 sm:py-6 transition-colors duration-75 hover:bg-neutral-50 focus:outline-none active:bg-neutral-100 ring-inset ring-neutral-500 focus-visible:ring-1 ${
                        activeTab === "avgOrderValue" ? "" : ""
                      }`}
                    >
                      <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-black transition-transform duration-75 ease-in-out ${
                        activeTab === "avgOrderValue" ? "translate-y-0" : "translate-y-[3px]"
                      }`}></div>
                      <div className="flex items-center gap-2.5 text-sm text-neutral-600">
                        <div className="h-2 w-2 rounded-sm bg-current shadow-[inset_0_0_0_1px_#00000019] text-violet-600/50"></div>
                        <span>Avg Order Value</span>
                      </div>
                      <div className="mt-1 flex h-12 items-center">
                        <span className="text-xl font-medium sm:text-3xl">
                          {analytics ? formatCurrency(analytics.summary.avgOrderValue) : "$0"}
                        </span>
                      </div>
                    </button>
                  </div>
                  
                  <div className="relative z-0 w-full">
                    <div className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-1.5">
                      <BarChart3 className="h-3 w-3 text-neutral-400" />
                    </div>
                    <button
                      onClick={() => setActiveTab("sales")}
                      className={`border-box relative block h-full w-full px-4 py-3 sm:px-8 sm:py-6 transition-colors duration-75 hover:bg-neutral-50 focus:outline-none active:bg-neutral-100 ring-inset ring-neutral-500 focus-visible:ring-1 ${
                        activeTab === "sales" ? "" : ""
                      }`}
                    >
                      <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-black transition-transform duration-75 ease-in-out ${
                        activeTab === "sales" ? "translate-y-0" : "translate-y-[3px]"
                      }`}></div>
                      <div className="flex items-center gap-2.5 text-sm text-neutral-600">
                        <div className="h-2 w-2 rounded-sm bg-current shadow-[inset_0_0_0_1px_#00000019] text-teal-400/50"></div>
                        <span>Sales</span>
                      </div>
                      <div className="mt-1 flex h-12 items-center">
                        <span className="text-xl font-medium sm:text-3xl">
                          {analytics ? formatCurrency(analytics.summary.totalRevenue) : "$0"}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="relative">
                <div className="relative overflow-hidden border-x border-b border-neutral-200 sm:rounded-b-xl">
                  <div className="p-5 pt-10 sm:p-10">
                    {isLoading ? (
                      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 transition-opacity duration-200">
                        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse"></div>
                        <div className="h-full w-full bg-neutral-100 rounded animate-pulse"></div>
                      </div>
                    ) : chartData.length === 0 ? (
                      <div className="flex h-96 w-full items-center justify-center transition-opacity duration-200">
                        <p className="text-sm text-neutral-600">No data available</p>
                      </div>
                    ) : (
                      <div className="h-96 w-full transition-opacity duration-200">
                          <TimeSeriesChart
                            key="analytics-chart"
                            type="area"
                            data={chartData}
                            series={chartSeries}
                            tooltipContent={getTooltipContent}
                            dateRange={dateRange}
                            margin={{
                              top: 12,
                              right: 5,
                              bottom: 32,
                              left: 20.5625,
                            }}
                          >
                          <YAxis
                            tickFormat={yAxisTickFormat}
                            showGridLines
                          />
                          <XAxis
                            maxTicks={selectedPresetId === "24h" ? 5 : undefined}
                            tickFormat={(date) => {
                              // For "last 24 hours", show time instead of dates
                              if (selectedPresetId === "24h") {
                                return date.toLocaleTimeString("en-US", { 
                                  hour: "numeric", 
                                  minute: "2-digit",
                                  hour12: true 
                                });
                              }
                              // Format based on data density
                              if (chartData.length <= 7) {
                                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                              }
                              return date.toLocaleDateString("en-US", { month: "short" });
                            }}
                          />
                          <OptimizedAreas />
                          <HorizontalReferenceLine />
                        </TimeSeriesChart>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          {/* Analytics Cards Grid */}
          {analytics && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Top Products / Orders Card with Tabs */}
                {((analytics.topProducts && analytics.topProducts.length > 0) || (analytics.recentOrders && analytics.recentOrders.length > 0)) && (
                  <div className="group relative z-0 h-[400px] flex flex-col overflow-hidden border border-neutral-200 bg-white sm:rounded-xl">
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 flex-shrink-0">
                      <div className="flex text-sm">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setProductsTab("orders")}
                            className={`p-4 transition-colors duration-75 ${
                              productsTab === "orders" 
                                ? "text-black" 
                                : "text-neutral-600 hover:text-neutral-900"
                            }`}
                            data-selected={productsTab === "orders"}
                          >
                            Orders
                          </button>
                          {productsTab === "orders" && (
                            <div className="absolute bottom-0 w-full px-1.5 text-bg-inverted" style={{ opacity: 1 }}>
                              <div className="h-0.5 rounded-t-full bg-current"></div>
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setProductsTab("topProducts")}
                            className={`p-4 transition-colors duration-75 ${
                              productsTab === "topProducts" 
                                ? "text-black" 
                                : "text-neutral-600 hover:text-neutral-900"
                            }`}
                            data-selected={productsTab === "topProducts"}
                          >
                            Top Products
                          </button>
                          {productsTab === "topProducts" && (
                          <div className="absolute bottom-0 w-full px-1.5 text-bg-inverted" style={{ opacity: 1 }}>
                            <div className="h-0.5 rounded-t-full bg-current"></div>
                          </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 pr-2 text-neutral-500">
                        <BarChart3 className="hidden h-4 w-4 sm:block" />
                        <p className="text-xs uppercase">
                          {productsTab === "topProducts" ? "revenue" : "orders"}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="h-full overflow-y-auto px-4 py-4">
                        {isLoading && productsTab === "orders" ? (
                          <div className="w-full space-y-2">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 animate-pulse"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="h-8 w-8 rounded-full bg-neutral-200 shrink-0"></div>
                                  <div className="flex flex-col min-w-0 flex-1 gap-2">
                                    <div className="h-4 w-32 bg-neutral-200 rounded"></div>
                                    <div className="h-3 w-48 bg-neutral-200 rounded"></div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0 ml-4 gap-2">
                                  <div className="h-4 w-16 bg-neutral-200 rounded"></div>
                                  <div className="h-3 w-12 bg-neutral-200 rounded"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : productsTab === "orders" && analytics.recentOrders && analytics.recentOrders.length > 0 ? (
                          <div className="w-full space-y-2">
                            {analytics.recentOrders
                              .filter((order) =>
                                !searchQuery || 
                                order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
                              )
                              .map((order) => {
                                const avatarUrl = `https://avatar.vercel.sh/${order.customerEmail}`;
                                
                                return (
                                  <a
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="block"
                                  >
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <img
                                        alt={order.customerEmail}
                                        draggable="false"
                                        loading="lazy"
                                        width={20}
                                        height={20}
                                        decoding="async"
                                        className="blur-0 rounded-full size-8 sm:size-8 shrink-0"
                                        src={avatarUrl}
                                        style={{ color: 'transparent' }}
                                      />
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <p className="font-medium text-sm text-neutral-800 truncate">
                                          {order.customerName || order.customerEmail}
                                        </p>
                                        <p className="text-xs text-neutral-500 truncate">
                                          {order.items.slice(0, 2).map((item, idx) => (
                                            <span key={idx}>
                                              {item.quantity}x {item.productName}
                                              {item.selectedSize && ` (${item.selectedSize})`}
                                              {idx < Math.min(order.items.length, 2) - 1 && ', '}
                                            </span>
                                          ))}
                                          {order.items.length > 2 && ` +${order.items.length - 2} more`}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0 ml-4">
                                      <span className="text-sm font-semibold text-neutral-900">
                                        {formatCurrency(order.total)}
                                      </span>
                                      <span className="text-xs text-neutral-500">
                                        {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                                      </span>
                                    </div>
                                  </div>
                                  </a>
                                );
                              })}
                          </div>
                        ) : isLoading && productsTab === "topProducts" ? (
                          <div className="w-full space-y-2">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 animate-pulse"
                              >
                                <div className="flex flex-col gap-2">
                                  <div className="h-4 w-40 bg-neutral-200 rounded"></div>
                                  <div className="h-3 w-24 bg-neutral-200 rounded"></div>
                                </div>
                                <div className="h-4 w-16 bg-neutral-200 rounded"></div>
                              </div>
                            ))}
                          </div>
                        ) : productsTab === "topProducts" && analytics.topProducts && analytics.topProducts.length > 0 ? (
                        <div className="w-full space-y-2">
                          {analytics.topProducts
                            .filter((product) =>
                              !searchQuery || 
                              product.name.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((product, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-lg bg-neutral-50"
                            >
                              <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-neutral-500">
                                  {product.unitsSold} units sold
                                </p>
                              </div>
                              <span className="text-sm font-semibold">
                                {formatCurrency(product.revenue)}
                              </span>
                            </div>
                          ))}
                        </div>
                        ) : !isLoading ? (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-sm text-neutral-600">No data available</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {/* Revenue Over Time Card */}
                {analytics.revenueOverTime && analytics.revenueOverTime.length > 0 && (
                  <div className="group relative z-0 h-[400px] flex flex-col overflow-hidden border border-neutral-200 bg-white sm:rounded-xl">
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 flex-shrink-0">
                      <div className="flex text-sm">
                        <div className="relative">
                          <button
                            type="button"
                            className="p-4 transition-colors duration-75 text-neutral-600 data-[selected=true]:text-black data-[selected=false]:hover:text-neutral-900"
                            data-selected="true"
                          >
                            Revenue Over Time
                          </button>
                          <div className="absolute bottom-0 w-full px-1.5 text-bg-inverted" style={{ opacity: 1 }}>
                            <div className="h-0.5 rounded-t-full bg-current"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 pr-2 text-neutral-500">
                        <BarChart3 className="hidden h-4 w-4 sm:block" />
                        <p className="text-xs uppercase">revenue</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="h-full overflow-y-auto px-4 py-4">
                        <div className="w-full space-y-2">
                          {analytics.revenueOverTime.slice(0, 10).map((item, idx) => {
                            const date = typeof item._id === "object" 
                              ? Object.values(item._id).join("/")
                              : String(item._id);
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg bg-neutral-50"
                              >
                                <span className="text-sm font-medium">{date}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs text-neutral-500">
                                    {item.orderCount} orders
                                  </span>
                                  <span className="text-sm font-semibold">
                                    {formatCurrency(item.revenue)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          )}
          </div>
        </div>
      </PageContent>
    </MainNav>
  );
}

