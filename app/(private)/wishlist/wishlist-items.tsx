"use client";

import { useEffect, useState } from "react";
import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "@/app/actions/wishlist";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Trash2,
  ShoppingBag,
  LogIn,
  Loader2,
  Grid,
  List,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Wishlist, WishlistItem } from "@/schema/wishlist";
import AddToCartButton from "@/components/add-to-cart-button";
import { useSession } from "next-auth/react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function WishlistItems() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const [clearingWishlist, setClearingWishlist] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    async function loadWishlist() {
      try {
        // Don't attempt to load wishlist if not authenticated
        if (status === "unauthenticated") {
          setLoading(false);
          return;
        }

        // Wait for session check to complete
        if (status === "loading") {
          return;
        }

        // i am logging the wishlist loading process
        console.log("Loading wishlist data...");
        const data = await getWishlist();
        console.log("Wishlist data received:", data);
        setWishlist(data);
      } catch (error: any) {
        console.error("Error in loadWishlist:", error);
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    }

    loadWishlist();
  }, [router, status]);

  const handleRemoveItem = async (itemId: string) => {
    setRemovingIds((prev) => [...prev, itemId]);
    try {
      const result = await removeFromWishlist({ itemId });

      if (result.success) {
        if (wishlist) {
          setWishlist({
            ...wishlist,
            items: wishlist.items.filter((item) => item.id !== itemId),
            totalItems: wishlist.totalItems - 1,
          });
        }
        toast.success("Item removed from wishlist");
      } else {
        toast.error(result.message || "Failed to remove item");
      }
    } catch (error: any) {
      console.error("Error removing item:", error);
      toast.error(error.message || "Failed to remove item");
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm("Are you sure you want to clear your wishlist?")) return;

    setClearingWishlist(true);
    try {
      const result = await clearWishlist();

      if (result.success) {
        setWishlist({ items: [], totalItems: 0 });
        toast.success("Wishlist cleared");
      } else {
        toast.error(result.message || "Failed to clear wishlist");
      }
    } catch (error: any) {
      console.error("Error clearing wishlist:", error);
      toast.error(error.message || "Failed to clear wishlist");
    } finally {
      setClearingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 animate-pulse">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg">Loading your wishlist...</p>
      </div>
    );
  }

  // If not authenticated, show sign-in prompt
  if (status === "unauthenticated") {
    return (
      <div className="py-16 flex flex-col items-center bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-sm">
        <LogIn className="h-16 w-16 text-muted-foreground mb-2" />
        <h2 className="mt-4 text-2xl font-bold">
          Sign in to view your wishlist
        </h2>
        <p className="mt-2 text-muted-foreground text-center max-w-md">
          You need to be signed in to save and view your favorite items.
        </p>
        <Button asChild className="mt-6 px-8">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-sm">
        <Heart className="h-16 w-16 text-muted-foreground mb-2" />
        <h2 className="mt-4 text-2xl font-bold">Your wishlist is empty</h2>
        <p className="mt-2 text-muted-foreground text-center max-w-md">
          Find something you love and save it for later.
        </p>
        <Button asChild className="mt-6 px-8">
          <Link href="/products">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            {wishlist.totalItems} {wishlist.totalItems === 1 ? "item" : "items"}{" "}
            in your wishlist
          </p>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) =>
              value && setViewMode(value as "grid" | "list")
            }
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearWishlist}
          disabled={clearingWishlist}
          className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All
        </Button>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.items.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              onRemove={() => handleRemoveItem(item.id)}
              isRemoving={removingIds.includes(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {wishlist.items.map((item) => (
            <WishlistItemList
              key={item.id}
              item={item}
              onRemove={() => handleRemoveItem(item.id)}
              isRemoving={removingIds.includes(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistItemCard({
  item,
  onRemove,
  isRemoving,
}: {
  item: WishlistItem & {
    product: {
      id: string;
      name: string;
      price: string;
      discountPrice: string | null;
      images: string[];
      slug: string;
      inventory: number;
    };
    variant?: {
      id: string;
      name: string;
      price: string | null;
      options: Record<string, string>;
    } | null;
  };
  onRemove: () => void;
  isRemoving: boolean;
}) {
  // Determine price to display (variant price or product price with possible discount)
  const price = item.variant?.price
    ? formatPrice(item.variant.price)
    : item.product.discountPrice
    ? formatPrice(item.product.discountPrice)
    : formatPrice(item.product.price);

  // Check if there's a discount
  const hasDiscount =
    !item.variant?.price && item.product.discountPrice !== null;

  // Calculate discount percentage if available
  const discountPercentage =
    hasDiscount && item.product.price && item.product.discountPrice
      ? Math.round(
          (1 -
            parseFloat(item.product.discountPrice) /
              parseFloat(item.product.price)) *
            100
        )
      : null;

  // Check if product is in stock
  const inStock = item.product.inventory > 0;

  // Get the first image or use a placeholder
  const imageUrl =
    item.product.images && item.product.images.length > 0
      ? item.product.images[0]
      : "https://placehold.co/300x300/f3f4f6/a1a1aa?text=No+Image";

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 h-full flex flex-col">
      <div className="relative">
        <Link
          href={`/products/${item.product.slug}`}
          className="block relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900"
        >
          <Image
            src={imageUrl}
            alt={item.product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority
          />
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-black/80 text-white px-4 py-2 rounded-md text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </Link>

        {hasDiscount && discountPercentage && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 px-2 py-1 text-xs font-bold">
            {discountPercentage}% OFF
          </Badge>
        )}

        <Button
          variant="secondary"
          size="icon"
          onClick={onRemove}
          disabled={isRemoving}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 hover:bg-white dark:bg-black/90 dark:hover:bg-black shadow-md transition-all hover:scale-110"
          aria-label="Remove from wishlist"
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
          ) : (
            <Trash2 className="h-4 w-4 text-red-500" />
          )}
        </Button>
      </div>

      <CardContent className="p-5 space-y-4 flex-grow flex flex-col">
        <Link
          href={`/products/${item.product.slug}`}
          className="block font-medium hover:underline line-clamp-2 text-lg group-hover:text-primary transition-colors"
        >
          {item.product.name}
          {item.variant && (
            <span className="text-sm text-muted-foreground block mt-1 font-normal">
              {item.variant.name}
            </span>
          )}
        </Link>

        <div className="flex items-baseline mt-auto">
          {hasDiscount && (
            <span className="text-muted-foreground line-through mr-2 text-sm">
              {formatPrice(item.product.price)}
            </span>
          )}
          <span className="font-bold text-lg text-primary">{price}</span>
        </div>

        <div className="pt-3 mt-auto">
          <AddToCartButton
            product={{
              id: item?.product?.id,
              name: item?.product?.name,
              inventory: item?.product?.inventory,
              price: item?.product?.price,
              discountPrice: item?.product?.discountPrice,
              images: item?.product?.images,
              slug: item?.product?.slug,
            }}
            variantId={item.variant?.id}
            inStock={inStock}
            quantity={1}
            showIcon={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function WishlistItemList({
  item,
  onRemove,
  isRemoving,
}: {
  item: WishlistItem & {
    product: {
      id: string;
      name: string;
      price: string;
      discountPrice: string | null;
      images: string[];
      slug: string;
      inventory: number;
    };
    variant?: {
      id: string;
      name: string;
      price: string | null;
      options: Record<string, string>;
    } | null;
  };
  onRemove: () => void;
  isRemoving: boolean;
}) {
  // Determine price to display (variant price or product price with possible discount)
  const price = item.variant?.price
    ? formatPrice(item.variant.price)
    : item.product.discountPrice
    ? formatPrice(item.product.discountPrice)
    : formatPrice(item.product.price);

  // Check if there's a discount
  const hasDiscount =
    !item.variant?.price && item.product.discountPrice !== null;

  // Calculate discount percentage if available
  const discountPercentage =
    hasDiscount && item.product.price && item.product.discountPrice
      ? Math.round(
          (1 -
            parseFloat(item.product.discountPrice) /
              parseFloat(item.product.price)) *
            100
        )
      : null;

  // Check if product is in stock
  const inStock = item.product.inventory > 0;

  // Get the first image or use a placeholder
  const imageUrl =
    item.product.images && item.product.images.length > 0
      ? item.product.images[0]
      : "https://placehold.co/300x300/f3f4f6/a1a1aa?text=No+Image";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-48 h-48">
          <Link
            href={`/products/${item.product.slug}`}
            className="block relative h-full overflow-hidden bg-slate-100 dark:bg-slate-900"
          >
            <Image
              src={imageUrl}
              alt={item.product.name}
              fill
              sizes="(max-width: 768px) 100vw, 192px"
              className="object-cover"
              priority
            />
            {!inStock && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-black/80 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Out of Stock
                </span>
              </div>
            )}
          </Link>

          {hasDiscount && discountPercentage && (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 px-2 py-1 text-xs font-bold">
              {discountPercentage}% OFF
            </Badge>
          )}
        </div>

        <div className="flex-1 p-5 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <Link
                href={`/products/${item.product.slug}`}
                className="block font-medium hover:underline text-lg hover:text-primary transition-colors"
              >
                {item.product.name}
              </Link>
              {item.variant && (
                <span className="text-sm text-muted-foreground block mt-1">
                  {item.variant.name}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              disabled={isRemoving}
              className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              aria-label="Remove from wishlist"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-baseline mt-2">
            {hasDiscount && (
              <span className="text-muted-foreground line-through mr-2 text-sm">
                {formatPrice(item.product.price)}
              </span>
            )}
            <span className="font-bold text-lg text-primary">{price}</span>
          </div>

          <div className="mt-auto pt-4 flex justify-end">
            <div className="w-full sm:w-48">
              <AddToCartButton
                product={{
                  id: item?.product?.id,
                  name: item?.product?.name,
                  inventory: item?.product?.inventory,
                  price: item?.product?.price,
                  discountPrice: item?.product?.discountPrice,
                  images: item?.product?.images,
                  slug: item?.product?.slug,
                }}
                variantId={item.variant?.id}
                inStock={inStock}
                quantity={1}
                showIcon={true}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
