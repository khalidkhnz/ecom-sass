import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWishlist } from "@/app/actions/wishlist";
import { getCart } from "@/app/actions/cart";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, User, Clock, Package } from "lucide-react";
import type { Wishlist } from "@/schema/wishlist";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch user's wishlist and cart data
  const wishlist = await getWishlist();
  const cart = await getCart();

  // For demo purposes - would be replaced with actual order data
  const recentOrders = [
    {
      id: "ORD-2023-001",
      date: "2023-12-15",
      status: "Delivered",
      total: "$129.99",
    },
    {
      id: "ORD-2023-002",
      date: "2024-03-22",
      status: "Processing",
      total: "$89.50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session.user.name || "User"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wishlist Items
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wishlist?.items.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Items saved for later
            </p>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto mt-2"
              asChild
            >
              <Link href="/wishlist">View all</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cart?.items.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Items ready for checkout
            </p>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto mt-2"
              asChild
            >
              <Link href="/cart">View cart</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Orders placed recently
            </p>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto mt-2"
              asChild
            >
              <Link href="/user/orders">View all</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>View your recent purchase history</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {order.date}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                    <p className="text-sm font-medium text-right mt-1">
                      {order.total}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <Button asChild variant="outline">
                  <Link href="/user/orders">View all orders</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                You haven't placed any orders yet.
              </p>
              <Button asChild className="mt-4">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Wishlist Items</CardTitle>
          <CardDescription>Products you've saved for later</CardDescription>
        </CardHeader>
        <CardContent>
          {wishlist.items && wishlist.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlist.items.slice(0, 4).map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                    {item.product.images && item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-14 w-14 object-contain"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${item.product.price}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {wishlist.items.length > 4 && (
                <div className="flex justify-end mt-4 md:col-span-2">
                  <Button asChild variant="outline">
                    <Link href="/wishlist">View all wishlist items</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Your wishlist is empty.</p>
              <Button asChild className="mt-4">
                <Link href="/shop">Discover Products</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
