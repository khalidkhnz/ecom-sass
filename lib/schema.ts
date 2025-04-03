export * from "@/schema/users";
export * from "@/schema/auth-tables";

// Export tables and relations separately to avoid conflicts
export {
  categories,
  type Category,
  type NewCategory,
} from "@/schema/categories";
export {
  subcategories,
  type Subcategory,
  type NewSubcategory,
} from "@/schema/subcategories";
export {
  products,
  productVariants,
  productReviews,
  relatedProducts,
  brands,
  vendors,
  inventoryTransactions,
  type Product,
  type NewProduct,
  type ProductVariant,
  type NewProductVariant,
  type ProductReview,
  type NewProductReview,
  type Brand,
  type NewBrand,
  type Vendor,
  type NewVendor,
} from "@/schema/products";

// Export relations
export {
  productsRelations,
  categoriesRelations,
  subcategoriesRelations,
  productVariantsRelations,
  productReviewsRelations,
  relatedProductsRelations,
} from "@/schema/relations";

export * from "@/schema/settings";
