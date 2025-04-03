import { relations } from "drizzle-orm";
import { categories } from "./categories";
import {
  products,
  productVariants,
  productReviews,
  relatedProducts,
  brands,
  vendors,
  inventoryTransactions,
} from "./products";
import { subcategories } from "./subcategories";

// Set up relations for products
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id],
  }),
  variants: many(productVariants),
  reviews: many(productReviews),
  inventoryTransactions: many(inventoryTransactions),
  relatedToProducts: many(relatedProducts, {
    relationName: "productRelations",
  }),
  relatedFromProducts: many(relatedProducts, {
    relationName: "relatedProductRelations",
  }),
}));

// Set up relations for categories
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  subcategories: many(subcategories),
}));

// Set up relations for subcategories
export const subcategoriesRelations = relations(
  subcategories,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [subcategories.categoryId],
      references: [categories.id],
    }),
    products: many(products),
  })
);

// Set up relations for product variants
export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  })
);

// Set up relations for product reviews
export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
}));

// Set up relations for related products
export const relatedProductsRelations = relations(
  relatedProducts,
  ({ one }) => ({
    product: one(products, {
      fields: [relatedProducts.productId],
      references: [products.id],
      relationName: "productRelations",
    }),
    relatedProduct: one(products, {
      fields: [relatedProducts.relatedProductId],
      references: [products.id],
      relationName: "relatedProductRelations",
    }),
  })
);
