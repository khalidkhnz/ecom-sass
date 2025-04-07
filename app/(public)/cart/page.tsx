"use client";

import React, { useState } from "react";
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
import { useCart } from "@/app/context/cart-context";
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
            Looks like you haven't added anything to your cart yet.
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
                      item.product.images && item.product.images.length > 0
                        ? item.product.images[0]
                        : "https://placehold.co/600x600/f3f4f6/a1a1aa?text=No+Image";

                    // Determine price to display
                    const unitPrice = item.variant?.price
                      ? parseFloat(String(item.variant.price))
                      : item.product.discountPrice
                      ? parseFloat(String(item.product.discountPrice))
                      : parseFloat(String(item.product.price));

                    const totalPrice = unitPrice * item.quantity;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="relative h-20 w-20 rounded overflow-hidden">
                            <Image
                              src={productImage}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-medium hover:underline"
                          >
                            {item.product.name}
                          </Link>
                          {item.variant && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Variant: {item.variant.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(unitPrice)}
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
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
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
                  Taxes and shipping calculated at checkout
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
