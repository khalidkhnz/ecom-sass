"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Edit,
  MoreHorizontal,
  Star,
  Trash,
  Search,
  Filter,
  Grid,
  ListFilter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useProducts, Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductCard } from "./product-card";
import { AlertModal } from "@/components/modals/alert-modal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

// Number of products to show per page
const PAGE_SIZE = 8;

export function ProductsClient() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { products, isLoading, deleteProduct, toggleFeatured } = useProducts();
  const { categories, isLoading: isCategoriesLoading } = useCategories();

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (product.tags &&
          product.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      const matchesCategory =
        categoryFilter === "all" || product.categoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setOpen(false);
      setDeletingId(null);
    }
  };

  const onToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await toggleFeatured({ id, featured });
      toast.success(
        `Product ${featured ? "unfeatured" : "featured"} successfully`
      );
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => deletingId && onDelete(deletingId)}
        loading={false}
        title="Are you sure?"
        description="This will permanently delete this product."
      />

      {/* Filters and Search */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            disabled={isCategoriesLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>View options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setView("table")}>
                <ListFilter className="mr-2 h-4 w-4" />
                Table view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("grid")}>
                <Grid className="mr-2 h-4 w-4" />
                Grid view
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setView(view === "grid" ? "table" : "grid")}
          >
            {view === "grid" ? (
              <ListFilter className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Products count summary */}
      <div className="text-sm text-muted-foreground mb-4">
        Showing {paginatedProducts.length} of {filteredProducts.length} products
        {categoryFilter !== "all" && " in selected category"}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Grid View */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedProducts.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No products found matching your criteria.
            </div>
          ) : (
            paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product as Product}
                onDeleteClick={(id) => {
                  setDeletingId(id);
                  setOpen(true);
                }}
                onToggleFeatured={onToggleFeatured}
              />
            ))
          )}
        </div>
      ) : (
        // Table View
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No products found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">₹</span>
                      {Number(product.price).toFixed(2)}
                    </TableCell>
                    <TableCell>{product.categoryName || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "active"
                            ? "default"
                            : product.status === "draft"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onToggleFeatured(product.id, product.featured)
                        }
                      >
                        <Star
                          className={
                            product.featured
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }
                          size={20}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      {product.tags && product.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.tags
                            .slice(0, 2)
                            .map((tag: string, i: number) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          {product.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(product.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/products/${product.id}`)
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setDeletingId(product.id);
                              setOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={i}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
