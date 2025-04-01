import {
  pgTable,
  serial,
  varchar,
  timestamp,
  decimal,
  integer,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { orderItems } from "./products";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address"),
  billingAddress: text("billing_address"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("unpaid"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));
