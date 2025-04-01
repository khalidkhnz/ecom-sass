import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";
import { orders } from "./orders";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  avatar: varchar("avatar", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  orders: many(orders),
}));
