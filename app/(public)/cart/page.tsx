"use client";

import React from "react";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem, clearItems } = useCart();

  // Early states (loading, empty)
  if (isLoading) {
    return (
      <Container>
        <div className="py-16 flex flex-col items-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground animate-pulse" />
          <h1 className="mt-4 text-2xl font-bold">Loading your cart...</h1>
        </div>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container>
        <div className="py-16 flex flex-col items-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            {`Looks like you haven't added anything to your cart yet.`}
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

  // Define tax type interfaces
  interface TaxInfo {
    rate: number;
    amount: number;
    label: string;
  }

  interface TaxSummary {
    [key: string]: TaxInfo;
  }

  // Define product interface with tax properties
  interface ProductWithTax {
    id: string;
    name: string;
    price: string;
    discountPrice: string | null;
    images: string[];
    slug: string;
    taxable?: boolean;
    taxRate?: string | number;
    taxType?: string;
    taxDetails?: {
      name: string | null;
      description: string | null;
      includedInPrice: boolean;
    };
  }

  // Calculate tax summary
  const taxSummary: TaxSummary = cart.items.reduce((acc: TaxSummary, item) => {
    // Get the product and potential variant with appropriate typing
    const product = item.product as unknown as ProductWithTax;
    const variant = item.variant;

    // Use product price or variant price
    const unitPrice = variant?.price
      ? parseFloat(String(variant.price))
      : product?.discountPrice
      ? parseFloat(String(product.discountPrice))
      : parseFloat(String(product?.price || "0"));

    const itemTotal = unitPrice * item.quantity;

    // Get tax information from the product
    const isTaxable = product.taxable !== undefined ? product.taxable : true;
    const taxRate =
      product.taxRate !== undefined ? parseFloat(String(product.taxRate)) : 0;
    const taxType = product.taxType || "vat";

    if (isTaxable && taxRate > 0) {
      // Since price is tax-inclusive, we need to calculate what portion is tax
      const taxAmount = itemTotal - itemTotal / (1 + taxRate / 100);

      // Add to the accumulated tax for this type
      if (!acc[taxType]) {
        acc[taxType] = {
          rate: taxRate,
          amount: 0,
          label: getTaxLabel(taxType),
        };
      }

      acc[taxType].amount += taxAmount;
    }

    return acc;
  }, {});

  // Convert the tax summary object to an array for rendering
  const taxBreakdown = Object.entries(taxSummary).map(([type, info]) => ({
    type,
    rate: info.rate,
    amount: info.amount,
    label: info.label,
  }));

  // Total tax amount
  const totalTaxAmount = taxBreakdown.reduce((sum, tax) => sum + tax.amount, 0);

  // Helper function to get readable tax label
  function getTaxLabel(taxType: string): string {
    const labels: { [key: string]: string } = {
      vat: "VAT",
      gst: "GST",
      sales: "Sales Tax",
      service: "Service Tax",
      custom: "Tax",
    };
    return labels[taxType] || "Tax";
  }

  return (
    <Container>
      <div className="py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <ShoppingCart className="mr-2 h-6 w-6" />
            Shopping Cart
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearItems()}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Product</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => {
                    // Get product image or placeholder
                    const productImage =
                      item.product?.images && item.product.images.length > 0
                        ? item.product.images[0]
                        : "https://placehold.co/600x600/f3f4f6/a1a1aa?text=No+Image";

                    // Determine price to display (already includes tax)
                    const unitPrice = item.variant?.price
                      ? parseFloat(String(item.variant.price))
                      : item.product?.discountPrice
                      ? parseFloat(String(item.product.discountPrice))
                      : parseFloat(String(item.product?.price || "0"));

                    const totalPrice = unitPrice * item.quantity;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="relative h-20 w-20 rounded overflow-hidden">
                            <Image
                              src={productImage}
                              alt={item.product?.name || "Product"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.product?.slug ? (
                            <Link
                              href={`/products/${item.product.slug}${
                                item?.variant?.id
                                  ? `?variant=${item?.variant?.id}`
                                  : ""
                              }`}
                              className="font-medium hover:underline"
                            >
                              {item.product.name}
                            </Link>
                          ) : (
                            <span className="font-medium">
                              {item.product?.name || "Loading product..."}
                            </span>
                          )}
                          {item.variant && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Variant: {item.variant.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(unitPrice)}
                          <div className="text-xs text-muted-foreground">
                            Inc. tax
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateItem(
                                  item.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateItem(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(totalPrice)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <Button variant="outline" asChild className="mt-2">
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal (inc. tax)
                  </span>
                  <span className="font-medium">
                    {formatPrice(cart.subtotal)}
                  </span>
                </div>

                {/* Only show tax breakdown if there are actual tax amounts */}
                {taxBreakdown.length > 0 && totalTaxAmount > 0.01 && (
                  <>
                    <div className="pt-2 pb-1">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Tax Breakdown:
                      </h3>
                    </div>
                    {taxBreakdown.map((tax) => (
                      <div
                        key={tax.type}
                        className="flex justify-between text-sm pl-4"
                      >
                        <span className="text-muted-foreground">
                          {tax.label} ({tax.rate.toFixed(2)}%)
                        </span>
                        <span className="font-medium">
                          {formatPrice(tax.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-muted-foreground">Total Tax</span>
                      <span>{formatPrice(totalTaxAmount)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>

                <Button className="w-full mt-4" size="lg">
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-xs text-center text-muted-foreground mt-4">
                  All prices include applicable taxes. Shipping will be
                  calculated at checkout.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
