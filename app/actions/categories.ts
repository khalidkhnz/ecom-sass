"use server";

import { db } from "@/lib/db";
import { categories } from "@/schema/categories";
import { products } from "@/schema/products";
import { createId } from "@paralleldrive/cuid2";
import { eq, sql, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for category validation
const categorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// Get all categories
export async function getCategories() {
  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
      })
      .from(categories)
      .orderBy(categories.name);

    // Get product counts for each category
    const productCounts = await db
      .select({
        categoryId: products.categoryId,
        count: sql<number>`count(${products.id})`,
      })
      .from(products)
      .groupBy(products.categoryId);

    // Create a map of category ID to product count
    const productCountMap = productCounts.reduce(
      (acc, { categoryId, count }) => {
        if (categoryId) {
          acc[categoryId] = count;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Combine the data
    const data = allCategories.map((category) => ({
      ...category,
      productCount: productCountMap[category.id] || 0,
    }));

    return { data };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { error: "Failed to fetch categories" };
  }
}

// Get a single category by ID
export async function getCategoryById(id: string) {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    return category;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw new Error("Failed to fetch category");
  }
}

// Create a new category
export async function createCategory(data: CategoryFormValues) {
  try {
    // Validate data
    const validatedData = categorySchema.parse(data);

    // Check if slug exists
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.slug, validatedData.slug),
    });

    if (existingCategory) {
      return { error: "A category with this slug already exists" };
    }

    // Create new category
    const newCategory = {
      id: createId(),
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
    };

    await db.insert(categories).values(newCategory);

    revalidatePath("/admin/categories");

    return { success: true, category: newCategory };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error creating category:", error);
    return { error: "Failed to create category" };
  }
}

// Update an existing category
export async function updateCategory(id: string, data: CategoryFormValues) {
  try {
    // Validate data
    const validatedData = categorySchema.parse(data);

    // Check if category exists
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!existingCategory) {
      return { error: "Category not found" };
    }

    // Update category
    await db
      .update(categories)
      .set({
        name: validatedData.name,
        description: validatedData.description || null,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id));

    revalidatePath("/admin/categories");

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error updating category:", error);
    return { error: "Failed to update category" };
  }
}

// Delete a category
export async function deleteCategory(id: string) {
  try {
    // Check if category exists and get associated products
    const categoryProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, id));

    const productCount = categoryProducts.length;

    // Delete category
    await db.delete(categories).where(eq(categories.id, id));

    // Update any associated products to remove the category
    if (productCount > 0) {
      await db
        .update(products)
        .set({ categoryId: null })
        .where(eq(products.categoryId, id));
    }

    revalidatePath("/admin/categories");

    return { success: true, productCount };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: "Failed to delete category" };
  }
}
