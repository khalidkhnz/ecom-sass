"use client";

import React, { useEffect, useState } from "react";
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
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
import { formatPrice } from "@/lib/utils";
import { getUserOrders } from "@/app/actions/orders";
import { formatDistanceToNow, format } from "date-fns";

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
        >
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "processing":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 hover:bg-blue-50"
        >
          <Clock className="h-3 w-3 mr-1" />
          Processing
        </Badge>
      );
    case "shipped":
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 hover:bg-orange-50"
        >
          <Truck className="h-3 w-3 mr-1" />
          Shipped
        </Badge>
      );
    case "delivered":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 hover:bg-green-50"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Delivered
        </Badge>
      );
    case "cancelled":
    case "failed":
    case "payment_failed":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 hover:bg-red-50"
        >
          <XCircle className="h-3 w-3 mr-1" />
          {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      );
    case "completed":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 hover:bg-green-50"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      );
  }
}

function getPaymentStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
        >
          Pending
        </Badge>
      );
    case "completed":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 hover:bg-green-50"
        >
          Completed
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 hover:bg-red-50"
        >
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // If not authenticated, redirect to login
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin?callbackUrl=/user/orders");
    }
  }, [status]);

  // Fetch orders when authenticated
  useEffect(() => {
    const fetchOrders = async () => {
      if (status === "authenticated") {
        try {
          setLoading(true);
          const result = await getUserOrders();

          if (result.success && result.orders) {
            setOrders(result.orders);
          } else {
            setError(result.message || "Failed to fetch orders");
          }
        } catch (err: any) {
          console.error("Error fetching orders:", err);
          setError(err.message || "An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [status]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Loading your orders...</h3>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Error loading orders</h3>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

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
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(parseFloat(order.grandTotal))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/checkout/success?orderId=${order.id}`}>
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
                {`You haven't placed any orders yet.`}
              </p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
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
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        {order.orderNumber}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(order.createdAt), "PPP")}
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-muted-foreground">
                      {`Payment: ${order.paymentMethod}`}
                    </div>
                    <div className="font-medium">
                      {formatPrice(parseFloat(order.grandTotal))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    asChild
                  >
                    <Link href={`/checkout/success?orderId=${order.id}`}>
                      View Order Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
