"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  PackageOpen,
  Calendar,
  ShoppingBag,
  Home,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getOrderById } from "@/app/actions/orders";
import { formatPrice } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function SuccessPage() {
  return (
    <Suspense>
      <SuspensedSuccessPage />
    </Suspense>
  );
}

function SuspensedSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        setError("Order ID is missing");
        return;
      }

      try {
        const response = await getOrderById(orderId);
        if (response.success && response.order) {
          setOrder(response.order);
        } else {
          setError(response.message || "Failed to fetch order details");
        }
      } catch (error: any) {
        console.error("Error fetching order:", error);
        setError(error.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Container>
        <div className="py-16 flex flex-col items-center">
          <PackageOpen className="h-16 w-16 text-primary animate-pulse" />
          <h1 className="mt-4 text-2xl font-bold">Loading order details...</h1>
        </div>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container>
        <div className="py-16 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <PackageOpen className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Order Not Found</h1>
          <p className="mt-2 text-muted-foreground max-w-md">
            {error ||
              "We couldn't find your order. Please check your order ID or contact customer support."}
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </Container>
    );
  }

  // Format the order date
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const relativeTime = formatDistanceToNow(orderDate, { addSuffix: true });

  return (
    <Container>
      <div className="py-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-muted-foreground max-w-md">
            Thank you for your purchase. Your order has been confirmed and will
            be processed soon.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PackageOpen className="mr-2 h-5 w-5" />
                  Order #{order.orderNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>
                      Placed {formattedDate} ({relativeTime})
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div
                      className={`w-2 h-2 rounded-full mr-1 ${
                        order.status === "processing"
                          ? "bg-blue-500"
                          : order.status === "completed"
                          ? "bg-green-500"
                          : order.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="capitalize">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Order items */}
                  <div>
                    <h3 className="font-medium mb-3">Items Ordered</h3>
                    <div className="space-y-3">
                      {order.items?.map((item: any) => {
                        const productData = item.productData;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-4"
                          >
                            <div className="relative h-16 w-16 rounded overflow-hidden border">
                              <img
                                src={
                                  productData.images?.[0] ||
                                  "https://placehold.co/600x600?text=No+Image"
                                }
                                alt={productData.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">
                                {productData.name}
                              </div>
                              {productData.variant && (
                                <div className="text-sm text-muted-foreground">
                                  Variant: {productData.variant.name}
                                </div>
                              )}
                              <div className="text-sm">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </div>
                            </div>
                            <div className="font-medium">
                              {formatPrice(item.totalPrice)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping address */}
                  <div>
                    <h3 className="font-medium mb-3">Shipping Address</h3>
                    <div className="text-sm">
                      <p className="font-medium">
                        {order.shippingAddress.name}
                      </p>
                      <p>{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && (
                        <p>{order.shippingAddress.addressLine2}</p>
                      )}
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && (
                        <p className="mt-1">
                          Phone: {order.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Information */}
                  <div>
                    <h3 className="font-medium mb-3">Payment Information</h3>
                    <div className="text-sm">
                      <p>
                        Payment Method:{" "}
                        <span className="capitalize">
                          {order.paymentMethod}
                        </span>
                      </p>
                      <p>
                        Payment Status:{" "}
                        <span className="capitalize">
                          {order.paymentStatus}
                        </span>
                      </p>
                    </div>
                  </div>

                  {order.customerNote && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-3">Order Notes</h3>
                        <div className="text-sm p-3 bg-muted/30 rounded-md">
                          {order.customerNote}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subTotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>
                      {order.shippingAmount > 0
                        ? formatPrice(order.shippingAmount)
                        : "Free"}
                    </span>
                  </div>
                  {order.taxAmount > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span>{formatPrice(order.taxAmount)}</span>
                    </div>
                  )}
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.grandTotal)}</span>
                </div>

                {/* Action buttons */}
                <div className="space-y-2 mt-6">
                  <Button asChild className="w-full">
                    <Link href="/user/orders">
                      <PackageOpen className="mr-2 h-4 w-4" />
                      View All Orders
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/products">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
