import {
  pgTable,
  timestamp,
  text,

} from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2";

export const users = pgTable("users", {
  id: text().primaryKey().$defaultFn(() => createId()),
  name: text(),
  email: text().notNull(),
  emailVerified: timestamp({ mode: "date" }),
  image: text(),
  role: text().notNull(),
  password: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
})
 
export type User = typeof users.$inferSelect;
