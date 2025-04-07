import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ExternalLink,
  Clock,
  Truck,
  CheckCircle2,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// This would be replaced with a real API call
async function getOrders() {
  // Demo data - in a real app this would come from your database
  return {
    orders: [
      {
        id: "ORD-2024-001",
        date: new Date("2024-03-22"),
        status: "Processing",
        total: 129.99,
        items: [
          {
            id: "item-1",
            name: "Wireless Headphones",
            price: 79.99,
            quantity: 1,
            image: "/images/headphones.jpg",
          },
          {
            id: "item-2",
            name: "Smart Watch",
            price: 49.99,
            quantity: 1,
            image: "/images/watch.jpg",
          },
        ],
      },
      {
        id: "ORD-2023-002",
        date: new Date("2023-12-15"),
        status: "Delivered",
        total: 89.5,
        items: [
          {
            id: "item-3",
            name: "Bluetooth Speaker",
            price: 89.5,
            quantity: 1,
            image: "/images/speaker.jpg",
          },
        ],
      },
      {
        id: "ORD-2023-001",
        date: new Date("2023-10-03"),
        status: "Cancelled",
        total: 215.75,
        items: [
          {
            id: "item-4",
            name: "Gaming Mouse",
            price: 45.99,
            quantity: 1,
            image: null,
          },
          {
            id: "item-5",
            name: "Mechanical Keyboard",
            price: 169.76,
            quantity: 1,
            image: null,
          },
        ],
      },
    ],
  };
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Processing":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 hover:bg-blue-50"
        >
          <Clock className="h-3 w-3 mr-1" />
          Processing
        </Badge>
      );
    case "Shipped":
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 hover:bg-orange-50"
        >
          <Truck className="h-3 w-3 mr-1" />
          Shipped
        </Badge>
      );
    case "Delivered":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 hover:bg-green-50"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Delivered
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 hover:bg-red-50"
        >
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function OrdersPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/signin");
  }

  const { orders } = await getOrders();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage your orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>All orders placed with your account</CardDescription>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{format(order.date, "PPP")}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/user/orders/${order.id}`}>
                          <span className="flex items-center gap-1">
                            Details <ExternalLink className="h-3 w-3 ml-1" />
                          </span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet.
              </p>
              <Button asChild>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {orders && orders.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mt-8">Recent Orders</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {orders.slice(0, 2).map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{order.id}</CardTitle>
                      <CardDescription>
                        {format(order.date, "PPP")}
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-14 w-14 object-contain"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <div className="flex justify-between mt-1">
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-medium">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-medium">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/user/orders/${order.id}`}>
                        View Order Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
