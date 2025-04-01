import { relations } from "drizzle-orm";
import { categories } from "./categories";
import { products } from "./products";

// Set up relations for products
export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

// Set up relations for categories
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));
