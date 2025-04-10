import { pgTable, timestamp, text, jsonb } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export interface Address {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  nameOnCard: string;
  isDefault: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  orderUpdates: boolean;
  shippingUpdates: boolean;
  deliveryUpdates: boolean;
  marketingEmails: boolean;
  productRecommendations: boolean;
  salesAndPromotions: boolean;
  backInStock: boolean;
  priceDrops: boolean;
  securityAlerts: boolean;
  accountActivity: boolean;
}

export interface PaymentPreferences {
  saveNewMethods: boolean;
  oneClickCheckout: boolean;
}

export const users = pgTable("users", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text(),
  email: text().notNull(),
  emailVerified: timestamp({ mode: "date" }),
  image: text(),
  role: text().notNull(),
  password: text(),
  addresses: jsonb("addresses").$type<Address[]>().default([]),
  paymentMethods: jsonb("payment_methods").$type<PaymentMethod[]>().default([]),
  notificationSettings: jsonb(
    "notification_settings"
  ).$type<NotificationSettings>(),
  paymentPreferences: jsonb("payment_preferences").$type<PaymentPreferences>(),
  adminNotes: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
