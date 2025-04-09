"use server";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, ShoppingCart, Package } from "lucide-react";
import { db } from "@/lib/db";
import { orders, users, products } from "@/lib/schema";
import { formatPrice } from "@/lib/utils";
import { sql, desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import Link from "next/link";

// Function to get status badge
function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
    case "processing":
      return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  }
}

export default async function DashboardPage() {
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

  const revenueChange =
    lastMonthTotal === 0
      ? 100
      : Math.round(
          ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        );

  // Get total customers
  const customerCount = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(users);

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

  const orderChange =
    lastMonthOrders[0].count === 0
      ? 100
      : Math.round(
          ((currentMonthOrders[0].count - lastMonthOrders[0].count) /
            lastMonthOrders[0].count) *
            100
        );

  // Get total products
  const productCount = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(products);

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
  const recentOrdersWithCustomers = recentOrders.map((order) => ({
    id: order.orderNumber,
    orderId: order.id,
    customer: userMap[order.userId] || "Unknown",
    date: format(new Date(order.createdAt), "yyyy-MM-dd"),
    amount: formatPrice(parseFloat(order.grandTotal)),
    status: order.status,
  }));

  const summaryData = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      change: `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`,
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      description: "Compared to last month",
    },
    {
      title: "Total Customers",
      value: customerCount[0].count.toString(),
      change: "+5.2%", // You can calculate this from historical data
      icon: <Users className="h-5 w-5 text-blue-600" />,
      description: "Active accounts",
    },
    {
      title: "Total Orders",
      value: orderCount[0].count.toString(),
      change: `${orderChange >= 0 ? "+" : ""}${orderChange}%`,
      icon: <ShoppingCart className="h-5 w-5 text-purple-600" />,
      description: `${orderCount[0].completed} completed`,
    },
    {
      title: "Total Products",
      value: productCount[0].count.toString(),
      change: "+3.8%", // You can calculate this from historical data
      icon: <Package className="h-5 w-5 text-orange-600" />,
      description: "Active products",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                {item.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span
                  className={
                    item.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {item.change}
                </span>
                <span className="ml-1">{item.description}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue for the current year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-gray-500">Revenue Chart Placeholder</p>
              {/* In a real app, you would use a chart library here like Chart.js or Recharts */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrdersWithCustomers.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/orders/${order.orderId}`}
                        className="hover:underline text-blue-600"
                      >
                        {order.id}
                      </Link>
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-right">
              <Link
                href="/admin/orders"
                className="text-sm text-blue-600 hover:underline"
              >
                View all orders →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
