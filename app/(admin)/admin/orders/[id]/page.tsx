"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ArrowLeft,
  Clock,
  Truck,
  CheckCircle2,
  ShoppingBag,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  CreditCard,
  Mail,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { getOrderDetails, updateOrderStatus } from "@/app/actions/orders";
import { format, formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
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
          {status
            ?.replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown"}
        </Badge>
      );
  }
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const result = await getOrderDetails(orderId);

        if (result.success && result.order) {
          setOrder(result.order);
        } else {
          setError(result.message || "Failed to fetch order details");
        }
      } catch (err: any) {
        console.error("Error fetching order details:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Handle order status update
  const handleStatusChange = async (newStatus: string) => {
    try {
      setProcessing(true);
      const result = await updateOrderStatus(orderId, newStatus);

      if (result.success) {
        toast.success("Status updated", {
          description: "Order status has been updated successfully",
        });

        // Refresh order details
        const updatedOrder = await getOrderDetails(orderId);
        if (updatedOrder.success && updatedOrder.order) {
          setOrder(updatedOrder.order);
        }
      } else {
        toast.error("Error", {
          description: result.message || "Failed to update order status",
        });
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error("Error", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Loading order details...</h3>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Order not found</h3>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Info + Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Order Summary</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(order.createdAt), "PPP")}
                  <div className="text-xs">
                    {formatDistanceToNow(new Date(order.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Order ID:</span>
                      <span className="text-muted-foreground">{order.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Payment Method:</span>
                      <span className="text-muted-foreground capitalize">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Payment Status:</span>
                      <span
                        className={`capitalize ${
                          order.paymentStatus === "completed"
                            ? "text-green-600"
                            : order.paymentStatus === "failed"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Customer:</span>
                      <span className="text-muted-foreground">
                        {order.user?.name ||
                          order.billingAddress?.name ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span className="text-muted-foreground">
                        {order.user?.email || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">User ID:</span>
                      <span className="text-muted-foreground">
                        {order.userId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <Button
                        variant="link"
                        className="h-auto p-0 text-primary"
                        asChild
                      >
                        <Link href={`/admin/orders?search=${order.userId}`}>
                          View Customer&apos;s Other Orders
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Status Update */}
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Update Order Status
                  </h3>
                  <div className="flex gap-3 items-center">
                    <Select
                      defaultValue={order.status}
                      disabled={
                        processing ||
                        ["cancelled", "completed", "refunded"].includes(
                          order.status
                        )
                      }
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {processing && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {order.items?.length || 0} items in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden relative bg-slate-100 flex items-center justify-center">
                        {item.productData?.images?.[0] ? (
                          <img
                            src={item.productData.images[0]}
                            alt={item.name}
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.name}
                        </h4>
                        {item.productData?.variant && (
                          <p className="text-xs text-muted-foreground">
                            Variant: {item.productData.variant.name}
                          </p>
                        )}
                        <div className="flex gap-4 mt-1 text-sm">
                          <p className="text-muted-foreground">
                            {formatPrice(parseFloat(item.price))} ×{" "}
                            {item.quantity}
                          </p>
                          <p className="text-muted-foreground">
                            SKU: {item.sku}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 font-medium">
                        {formatPrice(parseFloat(item.totalPrice))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No items found in this order
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shipping Address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.billingAddress.name}</p>
                  <p>{order.billingAddress.addressLine1}</p>
                  {order.billingAddress.addressLine2 && (
                    <p>{order.billingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.state}{" "}
                    {order.billingAddress.postalCode}
                  </p>
                  <p>{order.billingAddress.country}</p>
                  {order.billingAddress.phone && (
                    <p className="mt-1">Phone: {order.billingAddress.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Notes */}
          {order.customerNote && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted/30 rounded-md">
                  {order.customerNote}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Order Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(parseFloat(order.subTotal))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {order.shippingAmount &&
                    parseFloat(order.shippingAmount) > 0
                      ? formatPrice(parseFloat(order.shippingAmount))
                      : "Free"}
                  </span>
                </div>
                {order.taxAmount && parseFloat(order.taxAmount) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>{formatPrice(parseFloat(order.taxAmount))}</span>
                  </div>
                )}
                {order.discountAmount &&
                  parseFloat(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Discount</span>
                      <span>
                        -{formatPrice(parseFloat(order.discountAmount))}
                      </span>
                    </div>
                  )}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>{formatPrice(parseFloat(order.grandTotal))}</span>
              </div>

              {/* Payment Details */}
              <div className="mt-6 space-y-2">
                <h3 className="font-medium text-sm">Payment Details</h3>
                <div className="bg-muted/30 p-3 rounded-md space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span
                      className={`capitalize ${
                        order.paymentStatus === "completed"
                          ? "text-green-600"
                          : order.paymentStatus === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  {order.paymentDetails?.razorpayOrderId && (
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="truncate max-w-[140px]">
                        {order.paymentDetails.razorpayOrderId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {/* Print Invoice Button */}
                <Button variant="outline" disabled>
                  Print Invoice
                </Button>

                {/* Email Customer Button */}
                <Button variant="outline" disabled>
                  Email Customer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
