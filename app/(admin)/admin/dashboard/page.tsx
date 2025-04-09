"use client";

import React, { useState, useEffect } from "react";
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
import {
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import RevenueChart from "@/components/RevenueChart";
import {
  getDashboardSummary,
  getRecentOrders,
  getMonthlyRevenue,
} from "@/app/actions/dashboard";

// Define types
interface RecentOrder {
  id: string;
  orderId: string;
  customer: string;
  date: string;
  amount: number;
  status: string;
}

interface RevenueData {
  month: string;
  revenue: number;
}

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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    revenue: { total: 0, change: 0 },
    customers: { total: 0, change: 0 },
    orders: { total: 0, completed: 0, change: 0 },
    products: { total: 0, change: 0 },
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Fetch all dashboard data in parallel
        const [summaryResult, ordersResult, revenueResult] = await Promise.all([
          getDashboardSummary(),
          getRecentOrders(),
          getMonthlyRevenue(),
        ]);

        setSummaryData(summaryResult);
        setRecentOrders(ordersResult as RecentOrder[]);
        setRevenueData(revenueResult);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Prepare data for cards
  const cards = [
    {
      title: "Total Revenue",
      value: formatPrice(summaryData.revenue.total),
      change: `${summaryData.revenue.change >= 0 ? "+" : ""}${
        summaryData.revenue.change
      }%`,
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      description: "Compared to last month",
    },
    {
      title: "Total Customers",
      value: summaryData.customers.total.toString(),
      change: `${summaryData.customers.change >= 0 ? "+" : ""}${
        summaryData.customers.change
      }%`,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      description: "Active accounts",
    },
    {
      title: "Total Orders",
      value: summaryData.orders.total.toString(),
      change: `${summaryData.orders.change >= 0 ? "+" : ""}${
        summaryData.orders.change
      }%`,
      icon: <ShoppingCart className="h-5 w-5 text-purple-600" />,
      description: `${summaryData.orders.completed} completed`,
    },
    {
      title: "Total Products",
      value: summaryData.products.total.toString(),
      change: `${summaryData.products.change >= 0 ? "+" : ""}${
        summaryData.products.change
      }%`,
      icon: <Package className="h-5 w-5 text-orange-600" />,
      description: "Active products",
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-lg font-medium">Loading dashboard data...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((item, index) => (
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
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <>
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
                    {recentOrders.map((order) => (
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
                        <TableCell>{formatPrice(order.amount)}</TableCell>
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
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No orders found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
