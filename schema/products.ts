import {
  pgTable,
  timestamp,
  text,
  boolean,
  numeric,
  integer,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";

export const products = pgTable("products", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  price: numeric(10, 2).notNull(),
  inventory: integer().notNull().default(0),
  categoryId: text(),
  featured: boolean().notNull().default(false),
  status: text().notNull().default("draft"), // draft, active, archived
  images: text().array(),
  tags: text().array(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
