"use client";

import Link from "next/link";
import { Product } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, ShoppingCart, Heart } from "lucide-react";

interface ProductShowcaseProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

export function ProductShowcase({
  title,
  products,
  viewAllLink = "/products",
}: ProductShowcaseProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="mt-2 sm:mt-0 inline-flex items-center text-sm font-medium text-primary"
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const productImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://placehold.co/300x300/f3f4f6/a1a1aa?text=No+Image";

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // You can change this based on your store settings
  }).format(parseFloat(product.price));

  return (
    <Card className="h-full overflow-hidden border border-border rounded-lg transition-all hover:shadow-md">
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
          <p className="font-semibold text-lg">{formattedPrice}</p>
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
        <Button className="flex-1" size="sm" disabled={product.inventory <= 0}>
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
