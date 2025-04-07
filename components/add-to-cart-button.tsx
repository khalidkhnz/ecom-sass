"use client";

import { useState } from "react";
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
  };
  inStock: boolean;
  variantId?: string;
  quantity?: number;
  showIcon?: boolean;
  redirectToCart?: boolean;
}

export default function AddToCartButton({
  product,
  inStock,
  variantId,
  quantity = 1,
  showIcon = true,
  redirectToCart = false,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!inStock) return;

    setLoading(true);
    try {
      await addItem(product.id, quantity, variantId);
      setAdded(true);
      toast.success(`${product.name} added to cart!`);

      // Reset "Added" state after 2 seconds
      setTimeout(() => {
        setAdded(false);
      }, 2000);

      if (redirectToCart) {
        router.push("/cart");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="w-full"
      size="lg"
      disabled={!inStock || loading}
      onClick={handleAddToCart}
    >
      {loading ? (
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
