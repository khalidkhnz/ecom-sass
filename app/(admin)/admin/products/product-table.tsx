"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Star,
  StarOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inventory: number;
  status: string;
  featured: boolean;
  createdAt: string;
}

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const productToDelete = products.find((product) => product.id === deleteId);

  const handleEdit = (id: string) => {
    router.push(`/admin/products/${id}/edit`);
  };

  const handleView = (id: string) => {
    router.push(`/admin/products/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    // This would normally call a server action to delete the product
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Product deleted successfully");
      setDeleteId(null);
      // In a real app, you'd refresh the data here
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    // This would normally call a server action to update the product
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success(
        currentFeatured
          ? "Product removed from featured"
          : "Product marked as featured"
      );
      // In a real app, you'd refresh the data here
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Inventory</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Featured</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-4 text-muted-foreground"
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        product.inventory > 0 ? "default" : "destructive"
                      }
                    >
                      {product.inventory > 0
                        ? product.inventory
                        : "Out of stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                      className={
                        product.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={product.featured}
                        onCheckedChange={() =>
                          toggleFeatured(product.id, product.featured)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(product.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleView(product.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(product.id)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleFeatured(product.id, product.featured)
                          }
                        >
                          {product.featured ? (
                            <>
                              <StarOff className="mr-2 h-4 w-4" />
                              Remove from featured
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Mark as featured
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
