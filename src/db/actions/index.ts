"use server";

import { db } from "..";
import { products, users, orders, orderItems } from "../schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

// Users
export async function getUsers(limit = 10) {
  return db.select().from(users).limit(limit);
}

export async function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id));
}

export async function getUserWithOrders(userId: number) {
  return db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .leftJoin(orders, eq(users.id, orders.userId));
}

// Products
export async function getProducts(limit = 10) {
  return db.select().from(products).limit(limit);
}

export async function getProductById(id: number) {
  return db.select().from(products).where(eq(products.id, id));
}

export async function searchProducts(query: string) {
  const searchTerm = `%${query}%`;
  return db
    .select()
    .from(products)
    .where(
      sql`${products.name} ILIKE ${searchTerm} OR ${products.description} ILIKE ${searchTerm}`
    );
}

// Orders
export async function getOrdersWithItems(userId?: number) {
  const query = db
    .select()
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id));

  if (userId) {
    return query.where(eq(orders.userId, userId));
  }

  return query;
}

export async function createOrder(
  userId: number,
  items: Array<{ productId: number; quantity: number }>
) {
  // This would typically be wrapped in a transaction
  // For now, it's a simplified version

  // 1. Calculate total price from items
  let total = 0;

  for (const item of items) {
    const [product] = await db
      .select({ price: products.price })
      .from(products)
      .where(eq(products.id, item.productId));

    if (product) {
      total += parseFloat(product.price as string) * item.quantity;
    }
  }

  // 2. Create the order
  const [order] = await db
    .insert(orders)
    .values({
      userId,
      status: "pending",
      total: total.toString(),
    })
    .returning({ id: orders.id });

  // 3. Add order items
  for (const item of items) {
    const [product] = await db
      .select({ price: products.price })
      .from(products)
      .where(eq(products.id, item.productId));

    if (product) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: product.price as string,
      });
    }
  }

  return { orderId: order.id, total };
}
