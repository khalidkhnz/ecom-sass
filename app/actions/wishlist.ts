"use server";

import { db } from "@/lib/db";
import { wishlistItems, products, productVariants } from "@/lib/schema";
import { and, eq, desc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  addToWishlistSchema,
  removeFromWishlistSchema,
  checkWishlistSchema,
} from "@/zod/wishlist";
import type { Wishlist } from "@/schema/wishlist";

// Helper to get the current user ID
async function getUserId() {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user?.id) {
    throw new Error("You must be signed in to manage your wishlist");
  }

  return session.user.id;
}

// Get wishlist contents with product details
export async function getWishlist(): Promise<Wishlist> {
  try {
    const userId = await getUserId();

    // Instead of using full relations that might cause errors,
    // do a simpler query first to get the IDs
    const rawWishlistItems = await db
      .select({
        id: wishlistItems.id,
        product_id: wishlistItems.product_id,
        variant_id: wishlistItems.variant_id,
        created_at: wishlistItems.created_at,
        updated_at: wishlistItems.updated_at,
      })
      .from(wishlistItems)
      .where(eq(wishlistItems.user_id, userId))
      .orderBy(desc(wishlistItems.created_at));

    // Fetch product details separately
    const enrichedItems = await Promise.all(
      rawWishlistItems.map(async (item) => {
        try {
          // Get product data
          const productData = await db.query.products.findFirst({
            where: eq(products.id, item.product_id),
            columns: {
              id: true,
              name: true,
              price: true,
              discountPrice: true,
              images: true,
              slug: true,
              inventory: true,
            },
          });

          // Get variant data if applicable
          let variantData = null;
          if (item.variant_id) {
            variantData = await db.query.productVariants.findFirst({
              where: eq(productVariants.id, item.variant_id),
              columns: {
                id: true,
                name: true,
                price: true,
                options: true,
              },
            });
          }

          return {
            id: item.id,
            user_id: userId,
            product_id: item.product_id,
            variant_id: item.variant_id,
            created_at: item.created_at,
            updated_at: item.updated_at,
            product: productData || {
              id: item.product_id,
              name: "Product not found",
              price: "0",
              discountPrice: null,
              images: [],
              slug: "",
              inventory: 0,
            },
            variant: variantData,
          };
        } catch (error) {
          console.error("Error enriching wishlist item:", error);
          // Return a minimal item if enrichment fails
          return {
            id: item.id,
            user_id: userId,
            product_id: item.product_id,
            variant_id: item.variant_id,
            created_at: item.created_at,
            updated_at: item.updated_at,
            product: {
              id: item.product_id,
              name: "Error loading product",
              price: "0",
              discountPrice: null,
              images: [],
              slug: "",
              inventory: 0,
            },
            variant: null,
          };
        }
      })
    );

    return {
      items: enrichedItems,
      totalItems: enrichedItems.length,
    } as Wishlist;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    // Return empty wishlist on error
    return {
      items: [],
      totalItems: 0,
    };
  }
}

// Add product to wishlist
export async function addToWishlist(input: {
  productId: string;
  variantId?: string;
}) {
  // Validate input
  const result = addToWishlistSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Invalid input");
  }

  try {
    const { productId, variantId } = result.data;
    const userId = await getUserId();

    // Check if product exists
    const productExists = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!productExists) {
      throw new Error("Product not found");
    }

    // Check if variant exists if provided
    if (variantId) {
      const variantExists = await db.query.productVariants.findFirst({
        where: and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId)
        ),
      });

      if (!variantExists) {
        throw new Error("Variant not found");
      }
    }

    // Check if already in wishlist
    const existingItem = await db.query.wishlistItems.findFirst({
      where: and(
        eq(wishlistItems.user_id, userId),
        eq(wishlistItems.product_id, productId),
        variantId
          ? eq(wishlistItems.variant_id, variantId)
          : isNull(wishlistItems.variant_id)
      ),
    });

    if (existingItem) {
      // Already in wishlist, no need to add again
      return { success: true, message: "Item already in wishlist" };
    }

    // Add to wishlist
    await db.insert(wishlistItems).values({
      user_id: userId,
      product_id: productId,
      variant_id: variantId || null,
    });

    revalidatePath("/wishlist");

    return { success: true, message: "Added to wishlist" };
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);
    if (error.message?.includes("signed in")) {
      return {
        success: false,
        requiresAuth: true,
        message: "Please sign in to add items to your wishlist",
      };
    }
    return {
      success: false,
      message: error.message || "Failed to add to wishlist",
    };
  }
}

// Remove item from wishlist
export async function removeFromWishlist(input: { itemId: string }) {
  // Validate input
  const result = removeFromWishlistSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Invalid input");
  }

  try {
    const { itemId } = result.data;
    const userId = await getUserId();

    // Check if item exists and belongs to user
    const item = await db.query.wishlistItems.findFirst({
      where: and(
        eq(wishlistItems.id, itemId),
        eq(wishlistItems.user_id, userId)
      ),
    });

    if (!item) {
      throw new Error("Wishlist item not found");
    }

    // Delete the item
    await db.delete(wishlistItems).where(eq(wishlistItems.id, itemId));

    revalidatePath("/wishlist");

    return { success: true, message: "Removed from wishlist" };
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);
    return {
      success: false,
      message: error.message || "Failed to remove from wishlist",
    };
  }
}

// Remove product from wishlist (by product ID and variant ID)
export async function removeProductFromWishlist(input: {
  productId: string;
  variantId?: string;
}) {
  // Validate input
  const result = checkWishlistSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Invalid input");
  }

  try {
    const { productId, variantId } = result.data;
    const userId = await getUserId();

    // Find and delete the item
    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.user_id, userId),
          eq(wishlistItems.product_id, productId),
          variantId
            ? eq(wishlistItems.variant_id, variantId)
            : isNull(wishlistItems.variant_id)
        )
      );

    revalidatePath("/wishlist");

    return { success: true, message: "Removed from wishlist" };
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);
    return {
      success: false,
      message: error.message || "Failed to remove from wishlist",
    };
  }
}

// Clear entire wishlist
export async function clearWishlist() {
  try {
    const userId = await getUserId();

    // Delete all items for this user
    await db.delete(wishlistItems).where(eq(wishlistItems.user_id, userId));

    revalidatePath("/wishlist");

    return { success: true, message: "Wishlist cleared" };
  } catch (error: any) {
    console.error("Error clearing wishlist:", error);
    return {
      success: false,
      message: error.message || "Failed to clear wishlist",
    };
  }
}

// Check if product is in wishlist
export async function isInWishlist(input: {
  productId: string;
  variantId?: string;
}): Promise<boolean> {
  // Validate input
  const result = checkWishlistSchema.safeParse(input);

  if (!result.success) {
    return false;
  }

  try {
    const { productId, variantId } = result.data;
    const userId = await getUserId();

    // Check if item exists in wishlist
    const item = await db.query.wishlistItems.findFirst({
      where: and(
        eq(wishlistItems.user_id, userId),
        eq(wishlistItems.product_id, productId),
        variantId
          ? eq(wishlistItems.variant_id, variantId)
          : isNull(wishlistItems.variant_id)
      ),
    });

    return !!item;
  } catch (error) {
    // If error (e.g., user not logged in), item is not in wishlist
    console.error("Error checking wishlist status:", error);
    return false;
  }
}
