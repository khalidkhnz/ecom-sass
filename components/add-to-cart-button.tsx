"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    inventory: number | string;
    price: string;
    discountPrice?: string | null;
    images?: string[];
    slug?: string;
  };
  inStock: boolean;
  variantId?: string;
  variant?: {
    id: string;
    name: string;
    price?: string | null;
    options?: Record<string, string>;
  } | null;
  quantity?: number;
  showIcon?: boolean;
  redirectToCart?: boolean;
}

export default function AddToCartButton({
  product,
  inStock,
  variantId,
  variant,
  quantity = 1,
  showIcon = true,
  redirectToCart = false,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem, isLoading } = useCart();
  const router = useRouter();

  // Reset added state when cart loading changes
  useEffect(() => {
    if (isLoading) {
      // Cart is refreshing
      setLoading(true);
    } else if (loading) {
      // Cart has finished refreshing after our add operation
      setLoading(false);
      setAdded(true);

      // Reset "Added" state after 2 seconds
      const timer = setTimeout(() => {
        setAdded(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, loading]);

  const handleAddToCart = async () => {
    if (!inStock || loading) return;

    setLoading(true);
    try {
      await addItem(product.id, quantity, variantId);
      toast.success(`${product.name} added to cart!`);

      if (redirectToCart) {
        router.push("/cart");
      }
    } catch (error: any) {
      setLoading(false);
      setAdded(false);
      toast.error(error.message || "Failed to add item to cart");
    }
  };

  return (
    <Button
      className="w-full"
      size="lg"
      disabled={!inStock || loading || isLoading}
      onClick={handleAddToCart}
    >
      {loading || isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : added ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added to Cart
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}
          {inStock ? "Add to Cart" : "Out of Stock"}
        </>
      )}
    </Button>
  );
}
