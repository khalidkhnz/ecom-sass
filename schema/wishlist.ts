import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { products, productVariants } from "./products";
import { users } from "./users";

// Wishlist items table
export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    user_id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    product_id: text()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variant_id: text().references(() => productVariants.id, {
      onDelete: "set null",
    }),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userProductVariantIdx: uniqueIndex("user_product_variant_idx").on(
      table.user_id,
      table.product_id,
      sql`coalesce(${table.variant_id}, '')`
    ),
  })
);

// Wishlist type for use in the app
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;

// Full wishlist type with product details
export type Wishlist = {
  items: (WishlistItem & {
    product: {
      id: string;
      name: string;
      price: string;
      discountPrice: string | null;
      images: string[];
      slug: string;
      inventory: number;
    };
    variant?: {
      id: string;
      name: string;
      price: string | null;
      options: Record<string, string>;
    } | null;
  })[];
  totalItems: number;
};
