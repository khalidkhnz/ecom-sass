import {
  pgTable,
  timestamp,
  text,
  boolean,
  numeric,
  bigint,
  jsonb,
  index,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { subcategories } from "./subcategories";

// Define product status and other enums
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const productLabelEnum = pgEnum("product_label", [
  "new",
  "bestseller",
  "featured",
  "sale",
  "limited",
]);

export const shippingClassEnum = pgEnum("shipping_class", [
  "standard",
  "express",
  "free",
  "digital",
  "heavy",
]);

// Brands
export const brands = pgTable(
  "brands",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text(),
    logo: text(), // URL to logo image
    website: text(),
    featured: boolean().default(false),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIndex: index("brand_slug_idx").on(table.slug),
    featuredIndex: index("brand_featured_idx").on(table.featured),
  })
);

// Vendors (for marketplace functionality)
export const vendors = pgTable(
  "vendors",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text(),
    logo: text(), // URL to logo image
    email: text().notNull(),
    phone: text(),
    address: jsonb().default({}),
    status: text().default("pending").notNull(), // pending, active, suspended
    commissionRate: numeric("commission_rate", {
      precision: 5,
      scale: 2,
    }).default("10.00"), // Default 10% commission
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIndex: index("vendor_slug_idx").on(table.slug),
    statusIndex: index("vendor_status_idx").on(table.status),
  })
);

// Categories
export const categories = pgTable(
  "categories",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text(),
    image: text(),
    parentId: text(), // Self-reference will be defined in relations
    featured: boolean().default(false),
    sortOrder: numeric("sort_order", { precision: 10, scale: 0 }).default("0"),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIndex: index("category_slug_idx").on(table.slug),
    parentIndex: index("category_parent_idx").on(table.parentId),
    featuredIndex: index("category_featured_idx").on(table.featured),
  })
);

// Products
export const products = pgTable(
  "products",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text(),
    shortDescription: text(), // Brief description for product cards
    sku: text().notNull().unique(), // Unique SKU for tracking
    barcode: text().unique(), // Barcode for inventory/POS
    brandId: text().references(() => brands.id, { onDelete: "set null" }),
    price: numeric("price", { precision: 12, scale: 4 })
      .notNull()
      .default("0.0000"),
    costPrice: numeric("cost_price", { precision: 12, scale: 4 }).default(
      "0.0000"
    ),
    discountPrice: numeric("discount_price", {
      precision: 12,
      scale: 4,
    }).default("0.0000"),
    discountStart: timestamp(),
    discountEnd: timestamp(),
    inventory: numeric("inventory", { precision: 10, scale: 0 })
      .notNull()
      .default("0"),
    lowStockThreshold: numeric("low_stock_threshold", {
      precision: 10,
      scale: 0,
    }).default("5"),
    soldCount: numeric("sold_count", { precision: 10, scale: 0 })
      .notNull()
      .default("0"),
    categoryId: text().references(() => categories.id, { onDelete: "cascade" }),
    subcategoryId: text().references(() => subcategories.id),
    vendorId: text().references(() => vendors.id, { onDelete: "cascade" }), // Multi-vendor support
    featured: boolean().notNull().default(false),
    status: text().notNull().default("draft"),
    images: jsonb().$type<string[]>().default([]),
    tags: jsonb().$type<string[]>().default([]),
    features: jsonb().$type<string[]>().default([]), // Product features
    attributes: jsonb().default({}), // For color, size, material, etc.
    rating: numeric("rating", { precision: 3, scale: 2 }).default("0.00"),
    reviewCount: numeric("review_count", { precision: 10, scale: 0 }).default(
      "0"
    ),
    taxable: boolean().default(true),
    taxClass: text().default("standard"),
    weight: numeric("weight", { precision: 10, scale: 2 }).default("0.00"),
    dimensions: jsonb().default({
      length: "0.00",
      width: "0.00",
      height: "0.00",
    }),
    shippingClass: text().default("standard"),
    visibility: boolean().notNull().default(true), // Public or hidden
    isDigital: boolean().notNull().default(false), // True for digital products
    fileUrl: text(), // Digital product download URL
    labels: jsonb().$type<string[]>().default([]), // Product labels like "new", "bestseller", etc.
    metaTitle: text(), // SEO meta title
    metaDescription: text(), // SEO meta description
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIndex: index("slug_idx").on(table.slug),
    skuIndex: index("sku_idx").on(table.sku),
    categoryIndex: index("category_idx").on(table.categoryId),
    brandIndex: index("brand_idx").on(table.brandId),
    vendorIndex: index("vendor_idx").on(table.vendorId),
    statusIndex: index("status_idx").on(table.status),
    featuredIndex: index("featured_idx").on(table.featured),
    visibilityIndex: index("visibility_idx").on(table.visibility),
  })
);

// Product variants like sizes, colors, etc.
export const productVariants = pgTable(
  "product_variants",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text().notNull(), // E.g., "Small", "Red", etc.
    sku: text().notNull().unique(),
    barcode: text().unique(),
    price: numeric("price", { precision: 12, scale: 4 }).default("0.0000"),
    inventory: numeric("inventory", { precision: 10, scale: 0 }).default("0"),
    options: jsonb().default({}), // { size: "S", color: "Red" }
    images: jsonb().$type<string[]>().default([]),
    default: boolean().default(false), // Is this the default variant?
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    productIndex: index("product_variant_product_idx").on(table.productId),
    skuIndex: index("product_variant_sku_idx").on(table.sku),
  })
);

// Reviews for products
export const productReviews = pgTable(
  "product_reviews",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text().notNull(), // User who left the review
    rating: numeric("rating", { precision: 3, scale: 2 })
      .notNull()
      .default("0.00"),
    title: text(), // Optional review title
    content: text(), // Review text
    isVerifiedPurchase: boolean().default(false),
    helpfulCount: numeric("helpful_count", { precision: 10, scale: 0 }).default(
      "0"
    ),
    status: text().notNull().default("pending"), // pending, approved, rejected
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    productIndex: index("product_review_product_idx").on(table.productId),
    userIndex: index("product_review_user_idx").on(table.userId),
    statusIndex: index("product_review_status_idx").on(table.status),
  })
);

// Inventory transactions (for stock management)
export const inventoryTransactions = pgTable(
  "inventory_transactions",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text().references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    quantity: numeric("quantity", { precision: 10, scale: 0 })
      .notNull()
      .default("0"),
    type: text().notNull(), // purchase, sale, adjustment, return, etc.
    reference: text(), // Order ID, purchase order number, etc.
    notes: text(),
    createdBy: text(), // User who made the transaction
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    productIndex: index("inventory_tx_product_idx").on(table.productId),
    variantIndex: index("inventory_tx_variant_idx").on(table.variantId),
    typeIndex: index("inventory_tx_type_idx").on(table.type),
  })
);

// Related products (for cross-selling and up-selling)
export const relatedProducts = pgTable(
  "related_products",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    relatedProductId: text()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    type: text().notNull(), // related, upsell, cross-sell, accessory
    sortOrder: numeric("sort_order", { precision: 10, scale: 0 }).default("0"),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    productIndex: index("related_product_idx").on(table.productId),
    relatedIndex: index("related_related_idx").on(table.relatedProductId),
    uniqueRelation: index("related_unique_idx").on(
      table.productId,
      table.relatedProductId
    ),
  })
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type ProductReview = typeof productReviews.$inferSelect;
export type NewProductReview = typeof productReviews.$inferInsert;
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
