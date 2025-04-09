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
  adminNotes: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
