"use server";

import { db } from "@/lib/db";
import { orders, users, products } from "@/lib/schema";
import { sql, desc, eq } from "drizzle-orm";
import { format } from "date-fns";

// Get dashboard summary data (revenue, users, orders, products)
export async function getDashboardSummary() {
  try {
    // Get total revenue
    const revenueResult = await db
      .select({
        total: sql<string>`SUM(CAST(grand_total AS decimal))`,
      })
      .from(orders)
      .where(eq(orders.paymentStatus, "completed"));

    const totalRevenue = parseFloat(revenueResult[0]?.total || "0");

    // Get monthly revenue for comparison
    const now = new Date();
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = now.getFullYear();
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const lastMonthStart = new Date(lastMonthYear, lastMonth, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0);

    const currentMonthRevenue = await db
      .select({
        total: sql<string>`SUM(CAST(grand_total AS decimal))`,
      })
      .from(orders)
      .where(
        sql`payment_status = 'completed' AND 
          created_at >= ${currentMonthStart} AND 
          created_at < ${now}`
      );

    const lastMonthRevenue = await db
      .select({
        total: sql<string>`SUM(CAST(grand_total AS decimal))`,
      })
      .from(orders)
      .where(
        sql`payment_status = 'completed' AND 
          created_at >= ${lastMonthStart} AND 
          created_at < ${lastMonthEnd}`
      );

    const currentMonthTotal = parseFloat(currentMonthRevenue[0]?.total || "0");
    const lastMonthTotal = parseFloat(lastMonthRevenue[0]?.total || "0");

    // Calculate revenue change correctly
    let revenueChange = 0;
    if (lastMonthTotal === 0) {
      // If last month was 0, and this month has revenue, that's a 100% increase
      revenueChange = currentMonthTotal > 0 ? 100 : 0;
    } else {
      revenueChange = Math.round(
        ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      );
    }

    // Get total customers
    const customerCount = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(users);

    // Get customer count for comparison
    const currentMonthCustomers = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(sql`created_at >= ${currentMonthStart} AND created_at < ${now}`);

    const lastMonthCustomers = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(
        sql`created_at >= ${lastMonthStart} AND created_at < ${lastMonthEnd}`
      );

    // Calculate customer change correctly
    let customerChange = 0;
    if (lastMonthCustomers[0].count === 0) {
      // If last month was 0, and this month has customers, that's a 100% increase
      customerChange = currentMonthCustomers[0].count > 0 ? 100 : 0;
    } else {
      customerChange = Math.round(
        ((currentMonthCustomers[0].count - lastMonthCustomers[0].count) /
          lastMonthCustomers[0].count) *
          100
      );
    }

    // Get total orders
    const orderCount = await db
      .select({
        count: sql<number>`count(*)`,
        completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
      })
      .from(orders);

    // Get order count for comparison
    const currentMonthOrders = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(sql`created_at >= ${currentMonthStart} AND created_at < ${now}`);

    const lastMonthOrders = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(
        sql`created_at >= ${lastMonthStart} AND created_at < ${lastMonthEnd}`
      );

    // Calculate order change correctly
    let orderChange = 0;
    if (lastMonthOrders[0].count === 0) {
      // If last month was 0, and this month has orders, that's a 100% increase
      orderChange = currentMonthOrders[0].count > 0 ? 100 : 0;
    } else {
      orderChange = Math.round(
        ((currentMonthOrders[0].count - lastMonthOrders[0].count) /
          lastMonthOrders[0].count) *
          100
      );
    }

    // Get total products
    const productCount = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(products);

    // Get product count for comparison
    const currentMonthProducts = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(products)
      .where(sql`created_at >= ${currentMonthStart} AND created_at < ${now}`);

    const lastMonthProducts = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(products)
      .where(
        sql`created_at >= ${lastMonthStart} AND created_at < ${lastMonthEnd}`
      );

    // Calculate product change correctly
    let productChange = 0;
    if (lastMonthProducts[0].count === 0) {
      // If last month was 0, and this month has products, that's a 100% increase
      productChange = currentMonthProducts[0].count > 0 ? 100 : 0;
    } else {
      productChange = Math.round(
        ((currentMonthProducts[0].count - lastMonthProducts[0].count) /
          lastMonthProducts[0].count) *
          100
      );
    }

    return {
      revenue: {
        total: totalRevenue,
        change: revenueChange,
      },
      customers: {
        total: customerCount[0].count,
        change: customerChange,
      },
      orders: {
        total: orderCount[0].count,
        completed: orderCount[0].completed || 0,
        change: orderChange,
      },
      products: {
        total: productCount[0].count,
        change: productChange,
      },
    };
  } catch (error) {
    console.error("Error getting dashboard summary:", error);
    return {
      revenue: { total: 0, change: 0 },
      customers: { total: 0, change: 0 },
      orders: { total: 0, completed: 0, change: 0 },
      products: { total: 0, change: 0 },
    };
  }
}

// Get recent orders for the dashboard
export async function getRecentOrders() {
  try {
    // Get recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        createdAt: orders.createdAt,
        status: orders.status,
        grandTotal: orders.grandTotal,
        userId: orders.userId,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    // Get user names for recent orders
    const userIds = recentOrders.map((order) => order.userId);

    if (userIds.length === 0) {
      return [];
    }

    const userResults = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(sql`id IN (${userIds.join(",")})`);

    // Create a map of user IDs to names
    const userMap = userResults.reduce((map, user) => {
      map[user.id] = user.name || "";
      return map;
    }, {} as Record<string, string>);

    // Transform recent orders with user names
    return recentOrders.map((order) => ({
      id: order.orderNumber,
      orderId: order.id,
      customer: userMap[order.userId] || "Unknown",
      date: format(new Date(order.createdAt), "yyyy-MM-dd"),
      amount: parseFloat(order.grandTotal),
      status: order.status,
    }));
  } catch (error) {
    console.error("Error getting recent orders:", error);
    return [];
  }
}

// Get monthly revenue data for chart
export async function getMonthlyRevenue() {
  try {
    const currentYear = new Date().getFullYear();
    const months = [];

    // Get revenue for each month of the current year
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      const result = await db
        .select({
          total: sql<string>`SUM(CAST(grand_total AS decimal))`,
        })
        .from(orders)
        .where(
          sql`payment_status = 'completed' AND 
              created_at >= ${startDate} AND 
              created_at <= ${endDate}`
        );

      months.push({
        month: format(startDate, "MMM"),
        revenue: parseFloat(result[0]?.total || "0"),
      });
    }

    return months;
  } catch (error) {
    console.error("Error getting monthly revenue:", error);

    // Return empty data for all months
    return [
      { month: "Jan", revenue: 0 },
      { month: "Feb", revenue: 0 },
      { month: "Mar", revenue: 0 },
      { month: "Apr", revenue: 0 },
      { month: "May", revenue: 0 },
      { month: "Jun", revenue: 0 },
      { month: "Jul", revenue: 0 },
      { month: "Aug", revenue: 0 },
      { month: "Sep", revenue: 0 },
      { month: "Oct", revenue: 0 },
      { month: "Nov", revenue: 0 },
      { month: "Dec", revenue: 0 },
    ];
  }
}
