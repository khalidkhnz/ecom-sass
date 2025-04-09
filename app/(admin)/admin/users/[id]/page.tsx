"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getUserDetails, updateUser } from "@/app/actions/users";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import {
  User,
  Mail,
  Calendar,
  ShoppingBag,
  MapPin,
  ShoppingCart,
  ArrowLeft,
  Loader2,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    if (!id || typeof id !== "string") return;

    setLoading(true);
    try {
      const result: any = await getUserDetails(id);
      if (result.success && result.user) {
        setUser(result.user);
        setAdminNotes(result?.user?.adminNotes || "");
      } else {
        toast.error("Error", {
          description: result.message || "Failed to load user details",
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!id || typeof id !== "string") return;

    setSaving(true);
    try {
      const result = await updateUser(id, { adminNotes });
      if (result.success) {
        toast.success("Success", {
          description: "Admin notes updated successfully",
        });
      } else {
        toast.error("Error", {
          description: result.message || "Failed to update user",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The user you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have permission to view it.
        </p>
        <Button asChild>
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Users
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column with user info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>User Profile</CardTitle>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image || ""} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </div>
              <CardDescription>Basic user information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[1fr_2fr] gap-2">
                <div className="text-muted-foreground">Name</div>
                <div className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {user.name || "—"}
                </div>

                <div className="text-muted-foreground">Email</div>
                <div className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {user.email || "—"}
                </div>

                <div className="text-muted-foreground">Joined</div>
                <div className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(user.createdAt), "PPP")}
                </div>

                <div className="text-muted-foreground">Verified</div>
                <div>
                  {user.emailVerified ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700"
                    >
                      Not Verified
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Customer Stats</CardTitle>
              <CardDescription>User activity and history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total Orders
                  </div>
                  <div className="font-medium flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-1 text-blue-500" />
                    {user.statistics.totalOrders}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total Spent
                  </div>
                  <div className="font-medium">
                    {formatPrice(user.statistics.totalSpent)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Addresses</div>
                  <div className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-purple-500" />
                    {user.statistics.addressCount}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Cart Items
                  </div>
                  <div className="font-medium flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-1 text-orange-500" />
                    {user.statistics.cartItemCount}
                  </div>
                </div>
                {user.statistics.lastOrderDate && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Last Order
                    </div>
                    <div className="font-medium">
                      {format(new Date(user.statistics.lastOrderDate), "PP")}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Admin Notes</CardTitle>
              <CardDescription>Private notes about this user</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this customer..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button size="sm" onClick={handleSaveNotes} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Notes
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right column with tabs for orders, addresses, etc. */}
        <div className="md:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList className="w-full">
              <TabsTrigger value="orders" className="flex-1">
                Orders
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex-1">
                Addresses
              </TabsTrigger>
              <TabsTrigger value="cart" className="flex-1">
                Cart
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Order History
                  </CardTitle>
                  <CardDescription>
                    {user.recentOrders.length
                      ? `Showing ${user.recentOrders.length} most recent orders`
                      : "This user has no orders yet"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.recentOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No orders found</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user.recentOrders.map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                {order.orderNumber}
                              </TableCell>
                              <TableCell>
                                {format(new Date(order.createdAt), "PP")}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    order.status === "completed"
                                      ? "bg-green-50 text-green-700"
                                      : order.status === "processing"
                                      ? "bg-blue-50 text-blue-700"
                                      : order.status === "pending"
                                      ? "bg-yellow-50 text-yellow-700"
                                      : "bg-gray-50 text-gray-700"
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatPrice(parseFloat(order.grandTotal))}
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/admin/orders/${order.id}`}>
                                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                    View
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Saved Addresses
                  </CardTitle>
                  <CardDescription>
                    {user.addresses.length
                      ? `${user.addresses.length} saved addresses`
                      : "No saved addresses"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        This user hasn&apos;t saved any addresses yet
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.addresses.map((address: any) => (
                        <div
                          key={address.id}
                          className="border rounded-md p-4 relative"
                        >
                          {address.isDefault && (
                            <Badge className="absolute top-2 right-2">
                              Default
                            </Badge>
                          )}
                          <p className="font-medium mb-1">{address.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.addressLine1}
                            {address.addressLine2 && (
                              <>, {address.addressLine2}</>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.country}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {address.phone}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cart Tab */}
            <TabsContent value="cart" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Shopping Cart
                  </CardTitle>
                  <CardDescription>
                    {user.cartItems.length
                      ? `${user.cartItems.length} items in cart`
                      : "Cart is empty"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        This user&apos;s cart is empty
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {user.cartItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 border rounded-md"
                        >
                          <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                            {item.product?.images?.[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="h-14 w-14 object-contain"
                              />
                            ) : (
                              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">
                                {item.product.name}
                                {item.variant && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    - {item.variant.name}
                                  </span>
                                )}
                              </h3>
                              <p className="font-medium">
                                {formatPrice(parseFloat(item.price))}
                              </p>
                            </div>
                            <div className="flex justify-between mt-1">
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                              <p className="text-sm font-medium">
                                {formatPrice(
                                  parseFloat(item.price) * item.quantity
                                )}
                              </p>
                            </div>
                            <div className="mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="h-7 text-xs"
                              >
                                <Link
                                  href={`/admin/products/${item.product.id}`}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View Product
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
