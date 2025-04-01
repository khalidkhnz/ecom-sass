import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),

  // General settings
  siteName: varchar("site_name", { length: 100 }),
  siteUrl: varchar("site_url", { length: 255 }),
  adminEmail: varchar("admin_email", { length: 255 }),
  enableNotifications: boolean("enable_notifications").default(true),
  enableAnalytics: boolean("enable_analytics").default(true),

  // Store settings
  storeName: varchar("store_name", { length: 100 }),
  storeDescription: text("store_description"),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  enableGuestCheckout: boolean("enable_guest_checkout").default(true),
  enableAutomaticTax: boolean("enable_automatic_tax").default(false),
  maxProductsPerOrder: integer("max_products_per_order").default(10),
  shippingFrom: varchar("shipping_from", { length: 100 }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
