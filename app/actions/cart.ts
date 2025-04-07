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

// Helper to get or create cart ID
async function getCartId(): Promise<string> {
  // Get the cart ID from the cookie if it exists
  // Use type assertion to overcome TypeScript error
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
  const cartId = await getCartId();

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

  return {
    items: cartItemsData,
    totalItems,
    subtotal,
  };
}

// Add item to cart
export async function addToCart(
  input: FormData | { productId: string; variantId?: string; quantity?: number }
) {
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
}

// Update cart item quantity
export async function updateCartItem(
  input: FormData | { itemId: string; quantity: number }
) {
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
    throw new Error("Cart item not found");
  }

  // Update quantity
  await db
    .update(cartItems)
    .set({
      quantity,
      updatedAt: new Date(),
    })
    .where(eq(cartItems.id, itemId));

  revalidatePath("/cart");
}

// Remove item from cart
export async function removeCartItem(input: FormData | { itemId: string }) {
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
    throw new Error("Cart item not found");
  }

  // Delete the item
  await db.delete(cartItems).where(eq(cartItems.id, itemId));

  revalidatePath("/cart");
}

// Clear the entire cart
export async function clearCart() {
  const cartId = await getCartId();

  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

  revalidatePath("/cart");
}
