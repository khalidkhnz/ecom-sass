import { z } from "zod";

// Schema for adding an item to cart
export const addToCartSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().positive().default(1),
});

// Schema for updating cart item quantity
export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, { message: "Item ID is required" }),
  quantity: z.coerce.number().int().positive(),
});

// Schema for removing an item from cart
export const removeCartItemSchema = z.object({
  itemId: z.string().min(1, { message: "Item ID is required" }),
});

// Types for our cart operations
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;
