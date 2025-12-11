import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { authenticateRequest } from '~/lib/auth';

// Type definitions for aggregation results
interface ProductBreakdownResult {
  _id: string;
  revenue: number;
  unitsSold: number;
  orderCount: number;
  avgPrice: number;
  sizes: Array<{ size?: string; quantity: number }>;
  colors: Array<{ color?: string; quantity: number }>;
}

interface TimeRevenueResult {
  _id: Record<string, number> | number;
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
}

interface HourlyPatternResult {
  _id: number;
  revenue: number;
  orderCount: number;
}

interface DayOfWeekPatternResult {
  _id: number;
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
}

interface CustomerResult {
  _id: string;
  totalSpent: number;
  orderCount: number;
  avgOrderValue: number;
  firstOrder: Date;
  lastOrder: Date;
}

interface SummaryStatsResult {
  _id: null;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  maxOrderValue: number;
  minOrderValue: number;
}

interface SizeColorItem {
  size?: string;
  color?: string;
  quantity: number;
}

// Cache configuration for analytics
export const revalidate = 30; // Revalidate every 30 seconds
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') ?? 'all'; // week, month, year, all
    const groupBy = searchParams.get('groupBy') ?? 'day'; // hour, day, week, month

    // Get explicit date range parameters (preferred over period)
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    // Get filter parameters
    const orderStatus = searchParams.getAll('orderStatus');
    const product = searchParams.getAll('product');
    const category = searchParams.getAll('category');
    const customer = searchParams.getAll('customer');
    const paymentMethod = searchParams.getAll('paymentMethod');
    const country = searchParams.getAll('country');
    const city = searchParams.getAll('city');
    const region = searchParams.getAll('region');

    const client = await clientPromise;
    const db = client.db('mj-creative-candles');
    const orders = db.collection('orders');

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // Use explicit date range if provided, otherwise fall back to period
    if (fromParam) {
      startDate = new Date(fromParam);
    } else if (toParam) {
      // If only to is provided, use period to calculate from
      endDate = new Date(toParam);
      startDate = new Date(0); // Default to beginning of time
    } else {
      // Fall back to period-based calculation
      startDate = new Date(0); // Default to beginning of time
    }

    if (toParam) {
      endDate = new Date(toParam);
    }

    // Set date ranges based on period if explicit dates not provided
    if (!fromParam && !toParam) {
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      }
    }

    // Build match conditions for filters
    const matchConditions: Record<string, any> = {
      createdAt: { 
        $gte: startDate,
        $lte: endDate
      },
      // Include all order statuses except cancelled and payment_failed for analytics
      status: { $in: ['pending', 'paid', 'delivered', 'ready_for_pickup', 'processing', 'shipped'] }
    };

    // Apply filters
    if (orderStatus.length > 0) {
      matchConditions.status = { $in: orderStatus };
    }
    if (product.length > 0) {
      matchConditions['items.productName'] = { $in: product };
    }
    if (category.length > 0) {
      matchConditions['items.category'] = { $in: category };
    }
    if (customer.length > 0) {
      matchConditions['customer.email'] = { $in: customer };
    }
    if (paymentMethod.length > 0) {
      matchConditions.paymentMethod = { $in: paymentMethod };
    }
    if (country.length > 0) {
      matchConditions['shipping.country'] = { $in: country };
    }
    if (city.length > 0) {
      matchConditions['shipping.city'] = { $in: city };
    }
    if (region.length > 0) {
      matchConditions['shipping.state'] = { $in: region };
    }

    // Build aggregation pipeline
    const pipeline: Array<Record<string, unknown>> = [
      // Filter by date range, status, and other filters
      {
        $match: matchConditions
      },
      // Add computed fields for grouping
      {
        $addFields: {
          hour: { $hour: "$createdAt" },
          dayOfWeek: { $dayOfWeek: "$createdAt" },
          dayOfMonth: { $dayOfMonth: "$createdAt" },
          week: { $week: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        }
      }
    ];

    // Get time-based revenue breakdown
    const timeGrouping = getTimeGrouping(groupBy);
    const timePipeline = [
      ...pipeline,
      {
        $group: {
          _id: timeGrouping,
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$total" }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    // Get product breakdown
    const productPipeline = [
      ...pipeline,
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          revenue: { 
            $sum: { 
              $multiply: ["$items.productPrice", "$items.quantity"] 
            } 
          },
          unitsSold: { $sum: "$items.quantity" },
          orderCount: { $sum: 1 },
          avgPrice: { $avg: "$items.productPrice" },
          // Track size distribution
          sizes: {
            $push: {
              size: "$items.selectedSize",
              quantity: "$items.quantity"
            }
          },
          // Track color distribution
          colors: {
            $push: {
              color: "$items.selectedColor",
              quantity: "$items.quantity"
            }
          }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 } // Top 10 products
    ];

    // Get hourly pattern (for all time periods)
    const hourlyPatternPipeline = [
      ...pipeline,
      {
        $group: {
          _id: "$hour",
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    // Get day of week pattern
    const dayOfWeekPipeline = [
      ...pipeline,
      {
        $group: {
          _id: "$dayOfWeek",
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$total" }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    // Get customer insights
    const customerPipeline = [
      ...pipeline,
      {
        $group: {
          _id: "$customer.email",
          totalSpent: { $sum: "$total" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
          firstOrder: { $min: "$createdAt" },
          lastOrder: { $max: "$createdAt" }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 } // Top 10 customers
    ];

    // Get available filter values (unique countries, cities, states, payment methods, order statuses)
    const filterValuesPipeline = [
      ...pipeline,
      {
        $group: {
          _id: null,
          countries: { $addToSet: "$shipping.country" },
          cities: { $addToSet: "$shipping.city" },
          states: { $addToSet: "$shipping.state" },
          paymentMethods: { $addToSet: "$paymentMethod" },
          orderStatuses: { $addToSet: "$status" },
          customers: { $addToSet: "$customer.email" }
        }
      }
    ];

    // Get recent orders (limit to 50 most recent)
    const recentOrdersPipeline = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $project: {
          _id: 1,
          orderNumber: 1,
          customer: {
            firstName: 1,
            lastName: 1,
            email: 1
          },
          total: 1,
          status: 1,
          createdAt: 1,
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                productName: "$$item.productName",
                quantity: "$$item.quantity",
                productPrice: "$$item.productPrice",
                selectedSize: "$$item.selectedSize",
                selectedColor: "$$item.selectedColor"
              }
            }
          }
        }
      }
    ];

    // Execute all pipelines in parallel
    const [
      timeRevenue,
      productBreakdown,
      hourlyPattern,
      dayOfWeekPattern,
      topCustomers,
      summaryStats,
      filterValues,
      recentOrders
    ] = await Promise.all([
      orders.aggregate(timePipeline).toArray(),
      orders.aggregate(productPipeline).toArray(),
      orders.aggregate(hourlyPatternPipeline).toArray(),
      orders.aggregate(dayOfWeekPipeline).toArray(),
      orders.aggregate(customerPipeline).toArray(),
      // Get summary statistics
      orders.aggregate([
        ...pipeline,
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: "$total" },
            maxOrderValue: { $max: "$total" },
            minOrderValue: { $min: "$total" }
          }
        }
      ]).toArray(),
      orders.aggregate(filterValuesPipeline).toArray(),
      orders.aggregate(recentOrdersPipeline).toArray()
    ]);

    // Process product data to get size and color insights
    const processedProducts = (productBreakdown as ProductBreakdownResult[]).map((product) => {
      // Aggregate size data
      const sizeMap = new Map<string, number>();
      (product.sizes || []).forEach((item: SizeColorItem) => {
        if (item.size) {
          sizeMap.set(item.size, (sizeMap.get(item.size) ?? 0) + item.quantity);
        }
      });

      // Aggregate color data
      const colorMap = new Map<string, number>();
      (product.colors || []).forEach((item: SizeColorItem) => {
        if (item.color) {
          colorMap.set(item.color, (colorMap.get(item.color) ?? 0) + item.quantity);
        }
      });

      return {
        name: product._id,
        revenue: product.revenue,
        unitsSold: product.unitsSold,
        orderCount: product.orderCount,
        avgPrice: product.avgPrice,
        popularSizes: Array.from(sizeMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([size, quantity]) => ({ size, quantity })),
        popularColors: Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([color, quantity]) => ({ color, quantity }))
      };
    });

    // Map day of week numbers to names
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const processedDayOfWeek = (dayOfWeekPattern as DayOfWeekPatternResult[]).map((day) => ({
      day: dayNames[day._id - 1] ?? 'Unknown',
      revenue: day.revenue,
      orderCount: day.orderCount,
      avgOrderValue: day.avgOrderValue
    }));

    const filterData = (filterValues[0] as { countries?: string[]; cities?: string[]; states?: string[]; paymentMethods?: string[]; orderStatuses?: string[]; customers?: string[] } | undefined) ?? {};

    return NextResponse.json(
      {
      period,
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString()
      },
      summary: (summaryStats[0] as SummaryStatsResult | undefined) ?? {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        maxOrderValue: 0,
        minOrderValue: 0
      },
      revenueOverTime: timeRevenue as TimeRevenueResult[],
      topProducts: processedProducts,
      hourlyPattern: (hourlyPattern as HourlyPatternResult[]).map((h) => ({
        hour: h._id,
        time: `${h._id}:00`,
        revenue: h.revenue,
        orderCount: h.orderCount
      })),
      dayOfWeekPattern: processedDayOfWeek,
      topCustomers: (topCustomers as CustomerResult[]).map((c) => ({
        email: c._id,
        totalSpent: c.totalSpent,
        orderCount: c.orderCount,
        avgOrderValue: c.avgOrderValue,
        customerLifetimeValue: c.totalSpent,
        daysSinceFirstOrder: Math.floor((now.getTime() - new Date(c.firstOrder).getTime()) / (1000 * 60 * 60 * 24)),
        daysSinceLastOrder: Math.floor((now.getTime() - new Date(c.lastOrder).getTime()) / (1000 * 60 * 60 * 24))
      })),
      filterOptions: {
        countries: (filterData.countries ?? []).filter((c): c is string => Boolean(c)),
        cities: (filterData.cities ?? []).filter((c): c is string => Boolean(c)),
        states: (filterData.states ?? []).filter((s): s is string => Boolean(s)),
        paymentMethods: (filterData.paymentMethods ?? []).filter((p): p is string => Boolean(p)),
        orderStatuses: (filterData.orderStatuses ?? []).filter((s): s is string => Boolean(s)),
        customers: (filterData.customers ?? []).filter((c): c is string => Boolean(c))
      },
      recentOrders: (recentOrders as Array<{
        _id: string;
        orderNumber: string;
        customer: { firstName: string; lastName: string; email: string };
        total: number;
        status: string;
        createdAt: Date;
        items: Array<{ 
          productName: string; 
          quantity: number; 
          productPrice: number;
          selectedSize?: string;
          selectedColor?: string;
        }>;
      }>).map(order => ({
        id: String(order._id),
        orderNumber: order.orderNumber,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
        customerEmail: order.customer.email,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        items: order.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          productPrice: item.productPrice,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        }))
      }))
      },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function getTimeGrouping(groupBy: string) {
  switch (groupBy) {
    case 'hour':
      return {
        year: "$year",
        month: "$month",
        day: "$dayOfMonth",
        hour: "$hour"
      };
    case 'day':
      return {
        year: "$year",
        month: "$month",
        day: "$dayOfMonth"
      };
    case 'week':
      return {
        year: "$year",
        week: "$week"
      };
    case 'month':
      return {
        year: "$year",
        month: "$month"
      };
    default:
      return {
        year: "$year",
        month: "$month",
        day: "$dayOfMonth"
      };
  }
}

