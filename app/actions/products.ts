"use server";

import { db } from "@/lib/db";
import { products } from "@/schema/products";
import { categories } from "@/schema/categories";
import { createId } from "@paralleldrive/cuid2";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  price: z.coerce
    .number()
    .positive({ message: "Price must be a positive number" }),
  inventory: z.coerce
    .number()
    .int()
    .min(0, { message: "Inventory must be a non-negative integer" }),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  images: z.array(z.string()).default([]),
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
        price: products.price,
        inventory: products.inventory,
        status: products.status,
        featured: products.featured,
        categoryId: products.categoryId,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt));

    // Get category names for products
    const categoryIds = allProducts
      .map((product) => product.categoryId)
      .filter(Boolean) as string[];

    let categoryMap: Record<string, string> = {};

    if (categoryIds.length > 0) {
      const categoryData = await db
        .select({
          id: categories.id,
          name: categories.name,
        })
        .from(categories)
        .where(inArray(categories.id, categoryIds));

      categoryMap = categoryData.reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {} as Record<string, string>);
    }

    // Combine the data
    return allProducts.map((product) => ({
      ...product,
      categoryName: product.categoryId
        ? categoryMap[product.categoryId] || "Unknown"
        : null,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Get a single product by ID
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

    return {
      ...product,
      category,
    };
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw new Error("Failed to fetch product");
  }
}

// Create a new product
export async function createProduct(data: ProductFormValues) {
  try {
    // Validate data
    const validatedData = productSchema.parse(data);

    // Check if slug exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.slug, validatedData.slug),
    });

    if (existingProduct) {
      return { error: "A product with this slug already exists" };
    }

    // Create new product with type conversions
    const newProduct = {
      id: createId(),
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      price: String(validatedData.price),
      inventory: validatedData.inventory,
      categoryId: validatedData.categoryId || null,
      status: validatedData.status,
      featured: validatedData.featured,
      images: validatedData.images,
    };

    await db.insert(products).values(newProduct);

    revalidatePath("/admin/products");

    return {
      success: true,
      product: { ...newProduct, price: validatedData.price },
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

    // Update product with type conversions
    await db
      .update(products)
      .set({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        price: String(validatedData.price),
        inventory: validatedData.inventory,
        categoryId: validatedData.categoryId || null,
        status: validatedData.status,
        featured: validatedData.featured,
        images: validatedData.images,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    revalidatePath("/admin/products");

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
