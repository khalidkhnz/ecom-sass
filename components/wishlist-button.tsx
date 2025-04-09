"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import {
  addToWishlist,
  removeProductFromWishlist,
  isInWishlist,
} from "@/app/actions/wishlist";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface WishlistButtonProps {
  productId: string;
  variantId?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function WishlistButton({
  productId,
  variantId,
  variant = "outline",
  size = "icon",
  className,
}: WishlistButtonProps) {
  const [loading, setLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if product is already in wishlist
  useEffect(() => {
    // Only check if user is logged in
    if (!session?.user || status !== "authenticated") return;

    const checkWishlistStatus = async () => {
      try {
        const result = await isInWishlist({ productId, variantId });
        setInWishlist(result);
      } catch (error) {
        console.error("Error checking wishlist status", error);
      }
    };

    checkWishlistStatus();
  }, [productId, variantId, session, status]);

  const handleToggleWishlist = async () => {
    setLoading(true);

    // If not logged in, show sign in message
    if (!session?.user || status !== "authenticated") {
      toast.error("Please sign in to add to wishlist", {
        action: {
          label: "Sign In",
          onClick: () => router.push("/signin"),
        },
      });
      setLoading(false);
      return;
    }

    try {
      if (inWishlist) {
        // Remove from wishlist
        const result = await removeProductFromWishlist({
          productId,
          variantId,
        });
        if (result.success) {
          setInWishlist(false);
          toast.success("Removed from wishlist");
        } else {
          toast.error("Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        try {
          const result = await addToWishlist({ productId, variantId });

          if (result.requiresAuth) {
            toast.error(result.message, {
              action: {
                label: "Sign In",
                onClick: () => router.push("/signin"),
              },
            });
            return;
          }

          if (result.success) {
            setInWishlist(true);
            toast.success(result.message || "Added to wishlist");
          } else {
            toast.error(result.message || "Failed to add to wishlist");
          }
        } catch (addError: any) {
          console.error("Error adding to wishlist:", addError);
          if (addError.message?.includes("referencedTable")) {
            toast.error(
              "Error with wishlist database connection. Please try again later."
            );
          } else {
            toast.error(addError.message || "Error adding to wishlist");
          }
        }
      }
      // Refresh to update UI
      router.refresh();
    } catch (error: any) {
      console.error("Wishlist error:", error);
      // Specific error handling for database reference errors
      if (error.message?.includes("referencedTable")) {
        toast.error("Database connection issue. Please try again later.");
      } else {
        toast.error(error.message || "Error updating wishlist");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "w-[45px] h-[45px]",
        inWishlist && "text-red-500 hover:text-red-600",
        loading && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={loading}
      onClick={handleToggleWishlist}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
    </Button>
  );
}
