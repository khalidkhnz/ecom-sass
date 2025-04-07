import { z } from "zod";

// Add to wishlist schema
export const addToWishlistSchema = z.object({
  productId: z.string({
    required_error: "Product ID is required",
    invalid_type_error: "Product ID must be a string",
  }),
  variantId: z.string().optional(),
});

// Remove from wishlist schema
export const removeFromWishlistSchema = z.object({
  itemId: z.string({
    required_error: "Item ID is required",
    invalid_type_error: "Item ID must be a string",
  }),
});

// Check if in wishlist schema
export const checkWishlistSchema = z.object({
  productId: z.string({
    required_error: "Product ID is required",
    invalid_type_error: "Product ID must be a string",
  }),
  variantId: z.string().optional(),
});
