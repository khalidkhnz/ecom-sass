"use server";

import { db } from "@/lib/db";
import { cartItems, products, productVariants } from "@/lib/schema";
import { createId } from "@paralleldrive/cuid2";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, desc, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
} from "@/zod/cart";
import type { Cart } from "@/schema/cart";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorize";

// Helper to get or create cart ID
async function getCartId(): Promise<string> {
  // Check if user is authenticated
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    // For authenticated users, use their user ID as the cart ID
    return userId;
  }

  // For guest users, use cookie-based cart ID
  // Get the cart ID from the cookie if it exists
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  // If the cart ID doesn't exist, create a new one and set it
  if (!cartId) {
    const newCartId = createId();

    // Check if we're in a production environment
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set({
      name: "cartId",
      value: newCartId,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      secure: isProduction, // Only use secure cookies in production
    });

    return newCartId;
  }

  return cartId;
}

// Define types for the joined data
type CartItemWithDetails = {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    price: string;
    discountPrice: string | null;
    images: string[];
    slug: string;
    taxable: boolean;
    taxRate: string;
    taxType: string;
    taxDetails: {
      name: string | null;
      description: string | null;
      includedInPrice: boolean;
    };
  };
  variant: {
    id: string;
    name: string;
    price: string | null;
    options: Record<string, string>;
  } | null;
};

// Get cart contents with product details
export async function getCart(): Promise<Cart> {
  try {
    // Get cartId from session or cookie
    const cartId = await getCartId();
    console.log("Server: Getting cart for cartId:", cartId);

    // Get cart items with joined product details
    const cartItemsData = (await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, cartId),
      with: {
        product: {
          columns: {
            id: true,
            name: true,
            price: true,
            discountPrice: true,
            images: true,
            slug: true,
            taxable: true,
            taxRate: true,
            taxType: true,
            taxDetails: true,
          },
        },
        variant: {
          columns: {
            id: true,
            name: true,
            price: true,
            options: true,
          },
        },
      },
      orderBy: desc(cartItems.createdAt),
    })) as unknown as CartItemWithDetails[];

    console.log(`Server: Found ${cartItemsData.length} items in cart`);

    // Calculate cart totals
    const totalItems = cartItemsData.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const subtotal = cartItemsData.reduce((sum, item) => {
      // Use variant price if available, otherwise product price
      // Consider discount price if available
      let price = 0;

      if (item.variant?.price) {
        price = parseFloat(String(item.variant.price));
      } else if (item.product.discountPrice) {
        price = parseFloat(String(item.product.discountPrice));
      } else {
        price = parseFloat(String(item.product.price));
      }

      return sum + price * item.quantity;
    }, 0);

    const cart: Cart = {
      items: cartItemsData,
      totalItems,
      subtotal,
    };

    console.log("Server: Returning cart with totals:", {
      totalItems,
      subtotal,
    });
    return cart;
  } catch (error) {
    console.error("Server: Error getting cart:", error);
    // Return empty cart on error
    return { items: [], totalItems: 0, subtotal: 0 };
  }
}

// Add item to cart
export async function addToCart(
  input: FormData | { productId: string; variantId?: string; quantity?: number }
) {
  try {
    let data: Record<string, any>;

    if (input instanceof FormData) {
      data = Object.fromEntries(input);
      data.quantity = data.quantity ? parseInt(String(data.quantity)) : 1;
    } else {
      data = input;
    }

    // Validate input
    const { productId, variantId, quantity } = addToCartSchema.parse(data);

    // Check if product exists and is in stock
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: {
        inventory: true,
      },
    });

    if (!product || parseInt(String(product.inventory)) < 1) {
      throw new Error("Product is out of stock");
    }

    // Check variant if provided
    if (variantId) {
      const variant = await db.query.productVariants.findFirst({
        where: eq(productVariants.id, variantId),
        columns: {
          inventory: true,
        },
      });

      if (
        !variant ||
        (variant.inventory && parseInt(String(variant.inventory)) < 1)
      ) {
        throw new Error("Selected variant is out of stock");
      }
    }

    const cartId = await getCartId();

    // Check if item already in cart
    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, productId),
        variantId
          ? eq(cartItems.variantId, variantId)
          : sql`${cartItems.variantId} IS NULL`
      ),
    });

    if (existingItem) {
      // Update quantity if item exists
      await db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      // Add new item to cart
      await db.insert(cartItems).values({
        id: createId(),
        cartId,
        productId,
        variantId: variantId || null,
        quantity,
      });
    }

    revalidatePath("/cart");
    revalidatePath("/products/[productId]");

    return { success: true };
  } catch (error) {
    console.error("Error adding item to cart:", error);

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Failed to add item to cart" };
  }
}

// Update cart item quantity
export async function updateCartItem(
  input: FormData | { itemId: string; quantity: number }
) {
  try {
    let data: Record<string, any>;

    if (input instanceof FormData) {
      data = Object.fromEntries(input);
      data.quantity = parseInt(String(data.quantity));
    } else {
      data = input;
    }

    // Validate input
    const { itemId, quantity } = updateCartItemSchema.parse(data);

    const cartId = await getCartId();

    // Verify item belongs to current cart
    const item = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)),
    });

    if (!item) {
      return { error: "Item not found in cart" };
    }

    if (quantity <= 0) {
      // Remove the item if quantity is 0 or negative
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
    } else {
      // Update quantity
      await db
        .update(cartItems)
        .set({
          quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, itemId));
    }

    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { error: "Failed to update cart item" };
  }
}

// Remove item from cart
export async function removeCartItem(input: FormData | { itemId: string }) {
  try {
    let data: Record<string, any>;

    if (input instanceof FormData) {
      data = Object.fromEntries(input);
    } else {
      data = input;
    }

    // Validate input
    const { itemId } = removeCartItemSchema.parse(data);

    const cartId = await getCartId();

    // Verify item belongs to current cart
    const item = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)),
    });

    if (!item) {
      return { error: "Item not found in cart" };
    }

    // Delete the item
    await db.delete(cartItems).where(eq(cartItems.id, itemId));

    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("Error removing cart item:", error);
    return { error: "Failed to remove cart item" };
  }
}

// Clear the entire cart
export async function clearCart() {
  try {
    const cartId = await getCartId();

    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { error: "Failed to clear cart" };
  }
}

// Transfer cart items from one ID to another (for merging guest cart to user cart)
export async function transferCart(fromCartId: string, toCartId: string) {
  try {
    // Ensure user is authenticated for this operation
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to transfer a cart" };
    }

    if (toCartId !== session.user.id) {
      return { error: "Unauthorized cart transfer" };
    }

    // Get items from source cart
    const sourceItems = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, fromCartId),
    });

    // For each item in source cart
    for (const item of sourceItems) {
      // Check if target cart already has this product/variant combination
      const existingItem = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, toCartId),
          eq(cartItems.productId, item.productId),
          item.variantId
            ? eq(cartItems.variantId, item.variantId)
            : sql`${cartItems.variantId} IS NULL`
        ),
      });

      if (existingItem) {
        // Update quantity in target cart if item exists
        await db
          .update(cartItems)
          .set({
            quantity: existingItem.quantity + item.quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existingItem.id));
      } else {
        // Add new item to target cart
        await db.insert(cartItems).values({
          id: createId(),
          cartId: toCartId,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }
    }

    // Delete all items from source cart
    await db.delete(cartItems).where(eq(cartItems.cartId, fromCartId));

    // Note: Cookies would be handled by the client after successful transfer

    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("Error transferring cart:", error);
    return { error: "Failed to transfer cart" };
  }
}

// Function to fetch product details for local cart items
export async function getLocalCartItemDetails(
  items: { productId: string; variantId: string | null }[]
) {
  console.log("Server: getLocalCartItemDetails called with items:", items);

  if (!items || !items.length) {
    console.log("Server: No items provided to getLocalCartItemDetails");
    return [];
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const variantIds = items
    .filter((item) => item.variantId)
    .map((item) => item.variantId as string);

  console.log("Server: Fetching details for productIds:", productIds);

  // Fetch product details
  try {
    // Safety check for empty arrays
    if (productIds.length === 0) {
      console.log("Server: No product IDs to fetch");
      return [];
    }

    // Create parameterized SQL query
    const productsData = await db.query.products.findMany({
      where: sql`${products.id} IN (${sql.join(
        productIds.map((id) => sql`${id}`),
        sql`, `
      )})`,
      columns: {
        id: true,
        name: true,
        price: true,
        discountPrice: true,
        images: true,
        slug: true,
        inventory: true,
        taxable: true,
        taxRate: true,
        taxType: true,
        taxDetails: true,
      },
    });

    console.log("Server: Found products:", productsData);

    // Fetch variant details if needed
    let variantsData: any[] = [];
    if (variantIds && variantIds.length > 0) {
      variantsData = await db.query.productVariants.findMany({
        where: sql`${productVariants.id} IN (${sql.join(
          variantIds.map((id) => sql`${id}`),
          sql`, `
        )})`,
        columns: {
          id: true,
          name: true,
          price: true,
          options: true,
          productId: true,
          inventory: true,
        },
      });
      console.log("Server: Found variants:", variantsData);
    }

    // Create a map for quick lookups
    const productsMap = productsData.reduce((map, product) => {
      map[product.id] = {
        ...product,
        // Ensure images is always an array
        images: Array.isArray(product.images) ? product.images : [],
      };
      return map;
    }, {} as Record<string, any>);

    const variantsMap = variantsData.reduce((map, variant) => {
      map[variant.id] = variant;
      return map;
    }, {} as Record<string, any>);

    // Return the details for each item
    const result = items.map((item) => {
      const product = productsMap[item.productId];
      const variant = item.variantId ? variantsMap[item.variantId] : null;

      return {
        product: product || {
          id: item.productId,
          name: "Product not found",
          price: "0",
          discountPrice: null,
          images: [],
          slug: "",
          taxable: true,
          taxRate: "0",
          taxType: "vat",
          taxDetails: {
            name: null,
            description: null,
            includedInPrice: true,
          },
        },
        variant,
      };
    });

    console.log("Server: Returning product details:", result);
    return result;
  } catch (error) {
    console.error("Server: Error fetching product details:", error);
    return items.map((item) => ({
      product: {
        id: item.productId,
        name: "Error loading product",
        price: "0",
        discountPrice: null,
        images: [],
        slug: "",
        taxable: true,
        taxRate: "0",
        taxType: "vat",
        taxDetails: {
          name: null,
          description: null,
          includedInPrice: true,
        },
      },
      variant: null,
    }));
  }
}
