"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  FilterIcon,
  Package,
  RefreshCw,
  Search,
  ExternalLink,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { getAllOrders, updateOrderStatus } from "@/app/actions/orders";
import { Separator } from "@/components/ui/separator";
import { formatDistance } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
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

function getPaymentStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
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
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse URL params
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const statusFilter = searchParams.get("status") || "all";
  const paymentStatusFilter = searchParams.get("paymentStatus") || "all";
  const searchQuery = searchParams.get("search") || "";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";

  // State for orders data
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page,
    limit,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for filters and search
  const [search, setSearch] = useState(searchQuery);
  const [selectedFromDate, setSelectedFromDate] = useState<Date | undefined>(
    fromDate ? new Date(fromDate) : undefined
  );
  const [selectedToDate, setSelectedToDate] = useState<Date | undefined>(
    toDate ? new Date(toDate) : undefined
  );
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Function to update URL params
  const updateParams = (params: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        paymentStatus:
          paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
        search: searchQuery || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      };

      const result = await getAllOrders(page, limit, filters);

      if (result.success && result.orders) {
        setOrders(result?.orders);
        setPagination(result?.pagination as any);
      } else {
        setError(result.message || "Failed to fetch orders");
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when params change
  useEffect(() => {
    fetchOrders();
  }, [
    page,
    limit,
    statusFilter,
    paymentStatusFilter,
    searchQuery,
    fromDate,
    toDate,
  ]);

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const result = await updateOrderStatus(orderId, newStatus);

      if (result.success) {
        toast.success("Status updated", {
          description: "Order status has been updated successfully",
        });

        // Refresh the order list
        fetchOrders();
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
      setUpdatingOrderId(null);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search, page: 1 });
  };

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    updateParams({ status: value, page: 1 });
  };

  const handlePaymentStatusFilterChange = (value: string) => {
    updateParams({ paymentStatus: value, page: 1 });
  };

  const handleDateFilterChange = () => {
    updateParams({
      fromDate: selectedFromDate
        ? format(selectedFromDate, "yyyy-MM-dd")
        : null,
      toDate: selectedToDate ? format(selectedToDate, "yyyy-MM-dd") : null,
      page: 1,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedFromDate(undefined);
    setSelectedToDate(undefined);
    updateParams({
      status: "all",
      paymentStatus: "all",
      search: null,
      fromDate: null,
      toDate: null,
      page: 1,
    });
  };

  // Show loading state
  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Loading orders...</h3>
      </div>
    );
  }

  // Show error state
  if (error && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Error loading orders</h3>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button className="mt-4" onClick={() => fetchOrders()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">
            Manage customer orders and track their status
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters and Search</CardTitle>
          <CardDescription>Filter and search through orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by order #"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="secondary" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              {/* Order Status Filter */}
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Order Status</SelectLabel>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <Select
                  value={paymentStatusFilter}
                  onValueChange={handlePaymentStatusFilterChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Payment Status</SelectLabel>
                      <SelectItem value="all">All Payment Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
              <div className="w-full md:w-1/2">
                <Label htmlFor="fromDate" className="mb-2 block">
                  From Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      {selectedFromDate ? (
                        format(selectedFromDate, "PPP")
                      ) : (
                        <span className="text-muted-foreground">
                          Pick a date
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedFromDate}
                      onSelect={setSelectedFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-full md:w-1/2">
                <Label htmlFor="toDate" className="mb-2 block">
                  To Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      {selectedToDate ? (
                        format(selectedToDate, "PPP")
                      ) : (
                        <span className="text-muted-foreground">
                          Pick a date
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedToDate}
                      onSelect={setSelectedToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleDateFilterChange} variant="secondary">
                Apply Date Filter
              </Button>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Total {pagination.total} orders found
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
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
                            {formatDistance(
                              new Date(order.createdAt),
                              new Date(),
                              { addSuffix: true }
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{order.userId}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-7 px-2"
                                disabled={
                                  updatingOrderId === order.id ||
                                  [
                                    "cancelled",
                                    "completed",
                                    "refunded",
                                    "failed",
                                  ].includes(order.status)
                                }
                              >
                                {updatingOrderId === order.id ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  getStatusBadge(order.status)
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              <DropdownMenuLabel>
                                Update Status
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "pending")
                                  }
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "processing")
                                  }
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Processing
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "shipped")
                                  }
                                >
                                  <Truck className="h-4 w-4 mr-2" />
                                  Shipped
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "delivered")
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Delivered
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "completed")
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Completed
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "cancelled")
                                  }
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(parseFloat(order.grandTotal))}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <span className="flex items-center gap-1">
                                Details{" "}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-5">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    <strong>
                      {Math.min((page - 1) * limit + 1, pagination.total)}-
                      {Math.min(page * limit, pagination.total)}
                    </strong>{" "}
                    of <strong>{pagination.total}</strong> orders
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateParams({ page: page - 1 })}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateParams({ page: page + 1 })}
                      disabled={page >= pagination.totalPages}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters to find orders
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
