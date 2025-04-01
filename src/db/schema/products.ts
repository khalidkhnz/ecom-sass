import {
  pgTable,
  serial,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { orders } from "./orders";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: integer("created_by_id").references(() => users.id),
});

// Order items join table for many-to-many relationship
export const orderItems = pgTable(
  "order_items",
  {
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    priceAtPurchase: decimal("price_at_purchase", {
      precision: 10,
      scale: 2,
    }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.orderId, t.productId] }),
  })
);

// Define relations
export const productsRelations = relations(products, ({ one, many }) => ({
  creator: one(users, {
    fields: [products.createdById],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
