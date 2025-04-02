"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Star, Trash, Tag } from "lucide-react";
import { Product } from "@/hooks/useProducts";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onDeleteClick: (id: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
}

export function ProductCard({
  product,
  onDeleteClick,
  onToggleFeatured,
}: ProductCardProps) {
  const router = useRouter();

  const productImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://placehold.co/300x200/f3f4f6/a1a1aa?text=No+Image";

  const statusColors = {
    active: "bg-green-500",
    draft: "bg-gray-400",
    archived: "bg-red-500",
  };

  // Check if there's an active discount
  const now = new Date();
  const hasDiscount =
    product.discountPrice &&
    (!product.discountStart || new Date(product.discountStart) <= now) &&
    (!product.discountEnd || new Date(product.discountEnd) >= now);

  const formatPrice = (price: string) => {
    return Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    });
  };

  // Check if in low stock
  const isLowStock =
    product.inventory > 0 &&
    product.lowStockThreshold &&
    product.inventory <= product.lowStockThreshold;

  return (
    <Card className="overflow-hidden border-0 rounded-xl shadow-lg">
      {/* Image section with overlay gradient and featured icon */}
      <div className="relative h-52 w-full">
        <img
          src={productImage}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

        {/* Featured icon */}
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
          onClick={() => onToggleFeatured(product.id, product.featured)}
        >
          <Star
            className={
              product.featured
                ? "fill-yellow-400 text-yellow-400"
                : "text-white"
            }
            size={16}
          />
        </button>

        {/* Labels and Tags */}
        {(product.labels?.length > 0 || isLowStock) && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {isLowStock && (
              <Badge variant="destructive" className="text-xs">
                Low Stock
              </Badge>
            )}
            {product.labels?.slice(0, 2).map((label, i) => (
              <Badge
                key={i}
                className={cn(
                  "text-xs capitalize",
                  label === "sale" && "bg-red-500",
                  label === "new" && "bg-blue-500",
                  label === "bestseller" && "bg-purple-500"
                )}
              >
                {label}
              </Badge>
            ))}
          </div>
        )}

        {/* Status indicator */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                statusColors[product.status as keyof typeof statusColors]
              }`}
            ></div>
            <span className="text-white text-xs font-medium uppercase">
              {product.status}
            </span>
          </div>
        </div>

        {/* Bottom price bar */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <div className="text-white/70 line-through text-sm">
                ₹{formatPrice(product.price)}
              </div>
              <div className="text-white font-bold text-lg">
                ₹{formatPrice(product.discountPrice!)}
              </div>
            </div>
          ) : (
            <div className="text-white font-bold text-lg">
              ₹{formatPrice(product.price)}
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <p className="line-clamp-1">
                {product.categoryName || "Uncategorized"}
              </p>
              {product.sku && (
                <div className="flex items-center gap-0.5 text-xs">
                  <Tag size={10} />
                  <span>{product.sku}</span>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => router.push(`/admin/products/${product.id}`)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteClick(product.id)}
                className="text-red-600 cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stock and Attribute Info */}
        <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Stock:</span>
            <span
              className={cn(
                "font-medium",
                product.inventory <= 0
                  ? "text-red-500"
                  : isLowStock
                  ? "text-amber-500"
                  : "text-green-500"
              )}
            >
              {product.inventory <= 0 ? "Out of stock" : product.inventory}
            </span>
          </div>
          {product.soldCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Sold:</span>
              <span className="font-medium">{product.soldCount}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {product.tags.slice(0, 3).map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs font-medium px-2 py-0.5 rounded-full"
              >
                {tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs font-medium px-2 py-0.5 rounded-full"
              >
                +{product.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-2 text-xs text-gray-500 border-t flex justify-between">
        <span>Added {format(new Date(product.createdAt), "MMM d, yyyy")}</span>
        {product.rating > 0 && (
          <span className="flex items-center">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
            {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
