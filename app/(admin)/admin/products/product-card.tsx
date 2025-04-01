"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Star, Trash } from "lucide-react";
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
        <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-black/50 backdrop-blur-sm">
          <div className="text-white font-bold text-lg">
            ₹
            {Number(product.price).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-1">
              {product.categoryName || "Uncategorized"}
            </p>
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

      <CardFooter className="px-4 py-2 text-xs text-gray-500 border-t">
        Added {format(new Date(product.createdAt), "MMM d, yyyy")}
      </CardFooter>
    </Card>
  );
}
