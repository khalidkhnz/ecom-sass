"use server";

import { db } from "@/lib/db";
import { products, brands, productVariants } from "@/schema/products";
import { categories } from "@/schema/categories";
import { createId } from "@paralleldrive/cuid2";
import { eq, desc, sql, inArray, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";

// Schema for product validation
const productSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, { message: "SKU is required" }),
  barcode: z.string().optional(),
  price: z.coerce
    .number()
    .positive({ message: "Price must be a positive number" }),
  costPrice: z.coerce
    .number()
    .nonnegative({ message: "Cost price must be a non-negative number" })
    .optional(),
  discountPrice: z.coerce
    .number()
    .nonnegative({ message: "Discount price must be a non-negative number" })
    .optional(),
  discountStart: z.date().optional().nullable(),
  discountEnd: z.date().optional().nullable(),
  inventory: z.coerce
    .number()
    .int()
    .nonnegative({ message: "Inventory must be a non-negative integer" }),
  lowStockThreshold: z.coerce
    .number()
    .int()
    .nonnegative({
      message: "Low stock threshold must be a non-negative integer",
    })
    .optional(),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  visibility: z.boolean().default(true),
  taxable: z.boolean().default(true),
  taxClass: z.string().optional(),
  weight: z.coerce.number().optional(),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  shippingClass: z.string().optional(),
  isDigital: z.boolean().default(false),
  fileUrl: z.string().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  labels: z.array(z.string()).default([]),
  attributes: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, { message: "Variant name is required" }),
        sku: z.string().min(1, { message: "Variant SKU is required" }),
        barcode: z.string().optional(),
        price: z.coerce.number().positive().optional(),
        inventory: z.coerce.number().int().nonnegative().optional(),
        options: z.record(z.string(), z.string()).optional(),
        images: z.array(z.string()).default([]),
        default: z.boolean().default(false),
      })
    )
    .optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// Get all products
export async function getProducts() {
  try {
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        sku: products.sku,
        price: products.price,
        discountPrice: products.discountPrice,
        inventory: products.inventory,
        lowStockThreshold: products.lowStockThreshold,
        status: products.status,
        featured: products.featured,
        visibility: products.visibility,
        categoryId: products.categoryId,
        brandId: products.brandId,
        isDigital: products.isDigital,
        images: products.images,
        tags: products.tags,
        rating: products.rating,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt));

    // Get category names for products
    const categoryIds = allProducts
      .map((product) => product.categoryId)
      .filter(Boolean) as string[];

    let categoryMap: Record<string, { name: string; slug: string }> = {};

    if (categoryIds.length > 0) {
      const categoryData = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .where(inArray(categories.id, categoryIds));

      categoryMap = categoryData.reduce((acc, cat) => {
        acc[cat.id] = { name: cat.name, slug: cat.slug };
        return acc;
      }, {} as Record<string, { name: string; slug: string }>);
    }

    // Get brand names for products
    const brandIds = allProducts
      .map((product) => product.brandId)
      .filter(Boolean) as string[];

    let brandMap: Record<string, string> = {};

    if (brandIds.length > 0) {
      const brandData = await db
        .select({
          id: brands.id,
          name: brands.name,
        })
        .from(brands)
        .where(inArray(brands.id, brandIds));

      brandMap = brandData.reduce((acc, brand) => {
        acc[brand.id] = brand.name;
        return acc;
      }, {} as Record<string, string>);
    }

    // Combine the data
    return allProducts.map((product) => ({
      ...product,
      categoryName: product.categoryId
        ? categoryMap[product.categoryId]?.name || "Unknown"
        : null,
      categorySlug: product.categoryId
        ? categoryMap[product.categoryId]?.slug || null
        : null,
      brandName: product.brandId
        ? brandMap[product.brandId] || "Unknown"
        : null,
      // Calculate the actual price (considering discount)
      actualPrice: product.discountPrice
        ? product.discountPrice
        : product.price,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Get a single product by ID with variants
export async function getProductById(id: string) {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!product) {
      return null;
    }

    let category = null;
    if (product.categoryId) {
      category = await db.query.categories.findFirst({
        where: eq(categories.id, product.categoryId),
      });
    }

    let brand = null;
    if (product.brandId) {
      brand = await db.query.brands.findFirst({
        where: eq(brands.id, product.brandId),
      });
    }

    // Get variants for this product
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id));

    return {
      ...product,
      category,
      brand,
      variants,
    };
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw new Error("Failed to fetch product");
  }
}

// Get a single product by slug
export async function getProductBySlug(slug: string) {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });

    if (!product) {
      return null;
    }

    let category = null;
    if (product.categoryId) {
      category = await db.query.categories.findFirst({
        where: eq(categories.id, product.categoryId),
      });
    }

    let brand = null;
    if (product.brandId) {
      brand = await db.query.brands.findFirst({
        where: eq(brands.id, product.brandId),
      });
    }

    // Get variants for this product
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id));

    return {
      ...product,
      category,
      brand,
      variants,
    };
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    throw new Error("Failed to fetch product");
  }
}

// Create a new product
export async function createProduct(data: ProductFormValues) {
  try {
    // Validate data
    const validatedData = productSchema.parse(data);

    const slugExists = await db.query.products.findFirst({
      where: eq(products.slug, validatedData.slug),
    });

    if (slugExists) {
      return { error: "A product with this slug already exists" };
    }

    const skuExists = await db.query.products.findFirst({
      where: eq(products.sku, validatedData.sku),
    });

    if (skuExists) {
      return { error: "A product with this SKU already exists" };
    }

    // Create new product ID
    const id = createId();

    // Create product
    const newProduct = {
      id,
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      shortDescription: validatedData.shortDescription || null,
      sku: validatedData.sku,
      barcode: validatedData.barcode || null,
      price: String(validatedData.price),
      costPrice: validatedData.costPrice
        ? String(validatedData.costPrice)
        : null,
      discountPrice: validatedData.discountPrice
        ? String(validatedData.discountPrice)
        : null,
      discountStart: validatedData.discountStart || null,
      discountEnd: validatedData.discountEnd || null,
      inventory: String(validatedData.inventory),
      lowStockThreshold: validatedData.lowStockThreshold
        ? String(validatedData.lowStockThreshold)
        : "5",
      categoryId: validatedData.categoryId || null,
      brandId: validatedData.brandId || null,
      vendorId: validatedData.vendorId || null,
      status: validatedData.status,
      featured: validatedData.featured,
      visibility: validatedData.visibility,
      taxable: validatedData.taxable,
      taxClass: validatedData.taxClass || "standard",
      weight: validatedData.weight ? String(validatedData.weight) : null,
      dimensions: validatedData.dimensions || {
        length: 0,
        width: 0,
        height: 0,
      },
      shippingClass: validatedData.shippingClass || "standard",
      isDigital: validatedData.isDigital,
      fileUrl: validatedData.fileUrl || null,
      images: validatedData.images,
      tags: validatedData.tags || [],
      labels: validatedData.labels || [],
      attributes: validatedData.attributes || {},
      metaTitle: validatedData.metaTitle || null,
      metaDescription: validatedData.metaDescription || null,
    };

    await db.insert(products).values(newProduct);

    // Add variants if any
    if (validatedData.variants && validatedData.variants.length > 0) {
      const variantsToInsert = validatedData.variants.map((variant) => ({
        id: createId(),
        productId: newProduct.id,
        name: variant.name,
        sku: variant.sku,
        barcode: variant.barcode || null,
        price: variant.price ? String(variant.price) : null,
        inventory: variant.inventory ? String(variant.inventory) : "0",
        options: variant.options || {},
        images: variant.images || [],
        default: variant.default || false,
      }));

      // Insert each variant individually to avoid array issues
      for (const variant of variantsToInsert) {
        await db.insert(productVariants).values(variant);
      }
    }

    revalidatePath("/admin/products");

    return {
      success: true,
      productId: newProduct.id,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error creating product:", error);
    return { error: "Failed to create product" };
  }
}

// Update an existing product
export async function updateProduct(id: string, data: ProductFormValues) {
  try {
    // Validate data
    const validatedData = productSchema.parse(data);

    // Check if product exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!existingProduct) {
      return { error: "Product not found" };
    }

    // Check slug if changed
    if (validatedData.slug !== existingProduct.slug) {
      const slugExists = await db.query.products.findFirst({
        where: eq(products.slug, validatedData.slug),
      });

      if (slugExists) {
        return { error: "A product with this slug already exists" };
      }
    }

    // Check SKU if changed
    if (validatedData.sku !== existingProduct.sku) {
      const skuExists = await db.query.products.findFirst({
        where: and(
          eq(products.sku, validatedData.sku),
          isNull(eq(products.id, id))
        ),
      });

      if (skuExists) {
        return { error: "A product with this SKU already exists" };
      }
    }

    // Update product with type conversions
    await db
      .update(products)
      .set({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        shortDescription: validatedData.shortDescription || null,
        sku: validatedData.sku,
        barcode: validatedData.barcode || null,
        price: String(validatedData.price),
        costPrice: validatedData.costPrice
          ? String(validatedData.costPrice)
          : null,
        discountPrice: validatedData.discountPrice
          ? String(validatedData.discountPrice)
          : null,
        discountStart: validatedData.discountStart || null,
        discountEnd: validatedData.discountEnd || null,
        inventory: String(validatedData.inventory),
        lowStockThreshold: validatedData.lowStockThreshold
          ? String(validatedData.lowStockThreshold)
          : "5",
        categoryId: validatedData.categoryId || null,
        brandId: validatedData.brandId || null,
        vendorId: validatedData.vendorId || null,
        status: validatedData.status,
        featured: validatedData.featured,
        visibility: validatedData.visibility,
        taxable: validatedData.taxable,
        taxClass: validatedData.taxClass || "standard",
        weight: validatedData.weight ? String(validatedData.weight) : null,
        dimensions: validatedData.dimensions || {
          length: 0,
          width: 0,
          height: 0,
        },
        shippingClass: validatedData.shippingClass || "standard",
        isDigital: validatedData.isDigital,
        fileUrl: validatedData.fileUrl || null,
        images: validatedData.images,
        tags: validatedData.tags || [],
        labels: validatedData.labels || [],
        attributes: validatedData.attributes || {},
        metaTitle: validatedData.metaTitle || null,
        metaDescription: validatedData.metaDescription || null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    // Update variants
    if (validatedData.variants) {
      // Get existing variants
      const existingVariants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, id));

      // IDs of existing variants
      const existingVariantIds = existingVariants.map((v) => v.id);

      // IDs of variants in the form data
      const formVariantIds = validatedData.variants
        .filter((v) => v.id)
        .map((v) => v.id as string);

      // Variants to delete (existing but not in form data)
      const variantIdsToDelete = existingVariantIds.filter(
        (id) => !formVariantIds.includes(id)
      );

      // Delete variants that are no longer present
      if (variantIdsToDelete.length > 0) {
        await db
          .delete(productVariants)
          .where(inArray(productVariants.id, variantIdsToDelete));
      }

      // Update or insert variants
      for (const variant of validatedData.variants) {
        if (variant.id) {
          // Update existing variant
          await db
            .update(productVariants)
            .set({
              name: variant.name,
              sku: variant.sku,
              barcode: variant.barcode || null,
              price: variant.price ? String(variant.price) : null,
              inventory: variant.inventory ? String(variant.inventory) : "0",
              options: variant.options || {},
              images: variant.images || [],
              default: variant.default || false,
              updatedAt: new Date(),
            })
            .where(eq(productVariants.id, variant.id));
        } else {
          // Insert new variant
          await db.insert(productVariants).values({
            id: createId(),
            productId: id,
            name: variant.name,
            sku: variant.sku,
            barcode: variant.barcode || null,
            price: variant.price ? String(variant.price) : null,
            inventory: variant.inventory ? String(variant.inventory) : "0",
            options: variant.options || {},
            images: variant.images || [],
            default: variant.default || false,
          });
        }
      }
    }

    revalidatePath("/admin/products");
    revalidatePath(`/products/${validatedData.slug}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error updating product:", error);
    return { error: "Failed to update product" };
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    // Delete product
    await db.delete(products).where(eq(products.id, id));

    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Failed to delete product" };
  }
}

// Toggle product featured status
export async function toggleProductFeatured(id: string, featured: boolean) {
  try {
    await db
      .update(products)
      .set({
        featured: !featured,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    console.error("Error toggling product featured status:", error);
    return { error: "Failed to update product" };
  }
}

// Update product status
export async function updateProductStatus(
  id: string,
  status: "draft" | "active" | "archived"
) {
  try {
    await db
      .update(products)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    console.error("Error updating product status:", error);
    return { error: "Failed to update product status" };
  }
}

// Get all brands
export async function getBrands() {
  try {
    const allBrands = await db.select().from(brands).orderBy(brands.name);

    return allBrands;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw new Error("Failed to fetch brands");
  }
}

// Create a brand
export async function createBrand(data: {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
}) {
  try {
    const id = createId();

    await db.insert(brands).values({
      id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      logo: data.logo || null,
      website: data.website || null,
    });

    revalidatePath("/admin/brands");

    return { success: true, id };
  } catch (error) {
    console.error("Error creating brand:", error);
    return { error: "Failed to create brand" };
  }
}
