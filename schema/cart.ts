import {
  pgTable,
  text,
  integer,
  timestamp,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { products, productVariants } from "./products";

// Cart items table
export const cartItems = pgTable(
  "cart_items",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    cartId: text().notNull(), // This will be the user's ID or a session ID for guest users
    productId: text()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text().references(() => productVariants.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Use a unique index instead of a composite primary key
    cartProductVariantIndex: uniqueIndex("cart_product_variant_idx").on(
      table.cartId,
      table.productId,
      // Handle null in variantId by using a function
      sql`coalesce(${table.variantId}, '')`
    ),
  })
);

// Types for our cart items
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

// Cart type for use in the app
export type Cart = {
  items: (CartItem & {
    product: {
      id: string;
      name: string;
      price: string;
      discountPrice: string | null;
      images: string[];
      slug: string;
    };
    variant?: {
      id: string;
      name: string;
      price: string | null;
      options: Record<string, string>;
    } | null;
  })[];
  totalItems: number;
  subtotal: number;
};
