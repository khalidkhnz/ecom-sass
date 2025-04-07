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

// Mock data for the dashboard
const summaryData = [
  {
    title: "Total Revenue",
    value: "₹12,456.78",
    change: "+14.5%",
    icon: <DollarSign className="h-5 w-5 text-green-600" />,
    description: "Compared to last month",
  },
  {
    title: "Total Customers",
    value: "1,245",
    change: "+5.2%",
    icon: <Users className="h-5 w-5 text-blue-600" />,
    description: "Active accounts",
  },
  {
    title: "Total Orders",
    value: "856",
    change: "+10.3%",
    icon: <ShoppingCart className="h-5 w-5 text-purple-600" />,
    description: "Completed orders",
  },
  {
    title: "Total Products",
    value: "126",
    change: "+3.8%",
    icon: <Package className="h-5 w-5 text-orange-600" />,
    description: "Active products",
  },
];

const recentOrders = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    date: "2023-04-01",
    amount: "₹123.45",
    status: "completed",
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    date: "2023-04-01",
    amount: "₹67.89",
    status: "processing",
  },
  {
    id: "#ORD-003",
    customer: "Bob Johnson",
    date: "2023-04-01",
    amount: "₹210.99",
    status: "completed",
  },
  {
    id: "#ORD-004",
    customer: "Alice Brown",
    date: "2023-03-31",
    amount: "₹45.50",
    status: "pending",
  },
  {
    id: "#ORD-005",
    customer: "Charlie Wilson",
    date: "2023-03-31",
    amount: "₹175.25",
    status: "completed",
  },
];

export default function DashboardPage() {
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
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "processing"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
