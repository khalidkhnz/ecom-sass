"use client";

import { Product } from "@/hooks/useProducts";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const productImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://placehold.co/300x300/f3f4f6/a1a1aa?text=No+Image";

  const hasDiscount = !!product.discountPrice;
  const formattedOriginalPrice = formatPrice(product.price);
  const formattedDiscountPrice = product.discountPrice
    ? formatPrice(product.discountPrice)
    : null;

  // Calculate discount percentage if discount price is available
  const discountPercentage =
    product.discountPrice && parseFloat(product.discountPrice)
      ? Math.round(
          (1 - parseFloat(product.discountPrice) / parseFloat(product.price)) *
            100
        )
      : 0;

  return (
    <Card
      className={cn(
        "h-full overflow-hidden border border-border rounded-lg transition-all hover:shadow-md",
        hasDiscount && "border-red-200 shadow-sm"
      )}
    >
      <Link
        href={`/products/${product.id}`}
        className="block relative h-48 overflow-hidden"
      >
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {product.status === "active" && product.inventory <= 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Sold Out
          </Badge>
        )}
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
            {discountPercentage}% OFF
          </Badge>
        )}
        {product.featured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
            Featured
          </Badge>
        )}
      </Link>

      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/products/${product.id}`}>
              <h3 className="font-medium text-lg leading-tight line-clamp-1 hover:underline">
                {product.name}
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
              {product.categoryName || "Uncategorized"}
            </p>
          </div>
          <div className="text-right">
            {hasDiscount ? (
              <>
                <p className="font-semibold text-lg text-red-600">
                  {formattedDiscountPrice}
                </p>
                <p className="text-sm text-muted-foreground line-through">
                  {formattedOriginalPrice}
                </p>
              </>
            ) : (
              <p className="font-semibold text-lg">{formattedOriginalPrice}</p>
            )}
          </div>
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {product.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{product.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          className={cn("flex-1")}
          size="sm"
          disabled={product.inventory <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
