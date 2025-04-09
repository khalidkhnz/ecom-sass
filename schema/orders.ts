import {
  pgTable,
  timestamp,
  text,
  boolean,
  numeric,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { pgEnum } from "drizzle-orm/pg-core";

// Order status enum
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "refunded",
  "failed",
  "on_hold",
  "payment_pending",
  "payment_failed",
  "payment_completed",
  "shipped",
  "delivered",
]);

// Payment status enum
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "refunded",
  "cancelled",
]);

// Payment method enum
export const paymentMethodEnum = pgEnum("payment_method", [
  "razorpay",
  // Add other payment methods as needed
]);

// Orders table
export const orders = pgTable(
  "orders",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text().notNull(), // User ID who placed the order
    orderNumber: text().notNull().unique(), // Human-readable order number
    status: text().notNull().default("pending"),
    subTotal: numeric("sub_total", { precision: 12, scale: 4 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 4 }).notNull(),
    shippingAmount: numeric("shipping_amount", {
      precision: 12,
      scale: 4,
    }).notNull(),
    discountAmount: numeric("discount_amount", {
      precision: 12,
      scale: 4,
    }).default("0.0000"),
    grandTotal: numeric("grand_total", { precision: 12, scale: 4 }).notNull(),
    shippingAddress: jsonb().notNull(), // Shipping address
    billingAddress: jsonb().notNull(), // Billing address
    customerNote: text(), // Additional notes from customer
    adminNote: text(), // Notes from admin
    paymentMethod: text().notNull(), // Payment method used
    paymentStatus: text().notNull().default("pending"),
    paymentDetails: jsonb().default({}), // Payment-specific details like transaction IDs
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIndex: index("order_user_id_idx").on(table.userId),
    statusIndex: index("order_status_idx").on(table.status),
    createdAtIndex: index("order_created_at_idx").on(table.createdAt),
  })
);

// Order items table
export const orderItems = pgTable(
  "order_items",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    orderId: text()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text().notNull(), // Product ID
    variantId: text(), // Optional variant ID
    sku: text().notNull(), // SKU at the time of purchase
    name: text().notNull(), // Product name at the time of purchase
    price: numeric("price", { precision: 12, scale: 4 }).notNull(), // Unit price
    quantity: numeric("quantity", { precision: 10, scale: 0 }).notNull(),
    totalPrice: numeric("total_price", { precision: 12, scale: 4 }).notNull(), // Price * quantity
    productData: jsonb().notNull(), // Snapshot of product data at purchase time
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    orderIdIndex: index("order_item_order_id_idx").on(table.orderId),
    productIdIndex: index("order_item_product_id_idx").on(table.productId),
  })
);

// Payment transactions table
export const payments = pgTable(
  "payments",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    orderId: text()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    razorpayOrderId: text(), // Razorpay order ID
    razorpayPaymentId: text(), // Razorpay payment ID
    razorpaySignature: text(), // Razorpay signature for verification
    amount: numeric("amount", { precision: 12, scale: 4 }).notNull(),
    currency: text().notNull().default("INR"),
    method: text().notNull(), // Payment method
    status: text().notNull(), // Payment status
    paymentData: jsonb().default({}), // Full payment response data
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    orderIdIndex: index("payment_order_id_idx").on(table.orderId),
    statusIndex: index("payment_status_idx").on(table.status),
  })
);

// Export types
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
