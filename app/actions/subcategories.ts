"use server";

import { db } from "@/lib/db";
import { subcategories } from "@/schema/subcategories";
import { products } from "@/schema/products";
import { createId } from "@paralleldrive/cuid2";
import { eq, sql, count, and, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for subcategory validation
const subcategorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
  categoryId: z.string().min(1, { message: "Category is required" }),
});

export type SubcategoryFormValues = z.infer<typeof subcategorySchema>;

// Get all subcategories
export async function getSubcategories(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const { search, page = 1, limit = 10 } = params || {};
    const offset = (page - 1) * limit;

    // Build the query
    const queryBuilder = db
      .select({
        id: subcategories.id,
        name: subcategories.name,
        slug: subcategories.slug,
        description: subcategories.description,
        categoryId: subcategories.categoryId,
        createdAt: subcategories.createdAt,
        updatedAt: subcategories.updatedAt,
      })
      .from(subcategories);

    // Apply search filter if provided
    const filteredQuery = search
      ? queryBuilder.where(
          sql`(${subcategories.name} LIKE ${`%${search}%`} OR ${
            subcategories.slug
          } LIKE ${`%${search}%`})`
        )
      : queryBuilder;

    // Get total count for pagination
    const countQuery = search
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(subcategories)
          .where(
            sql`(${subcategories.name} LIKE ${`%${search}%`} OR ${
              subcategories.slug
            } LIKE ${`%${search}%`})`
          )
      : db.select({ count: sql<number>`count(*)` }).from(subcategories);

    const [{ count }] = await countQuery;
    const totalPages = Math.ceil(count / limit);

    // Apply pagination
    const allSubcategories = await filteredQuery
      .orderBy(subcategories.name)
      .limit(limit)
      .offset(offset);

    // Get product counts for each subcategory
    const productCounts = await db
      .select({
        subcategoryId: products.subcategoryId,
        count: sql<number>`count(${products.id})`,
      })
      .from(products)
      .groupBy(products.subcategoryId);

    // Create a map of subcategory ID to product count
    const productCountMap = productCounts.reduce(
      (acc, { subcategoryId, count }) => {
        if (subcategoryId) {
          acc[subcategoryId] = count;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Get category names for each subcategory
    const categoryIds = allSubcategories.map((sub) => sub.categoryId);
    const categories = await db.query.categories.findMany({
      where: (categories, { inArray }) => inArray(categories.id, categoryIds),
      columns: {
        id: true,
        name: true,
      },
    });

    // Create a map of category ID to name
    const categoryMap = categories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {} as Record<string, string>);

    // Combine the data
    const data = allSubcategories.map((subcategory) => ({
      ...subcategory,
      productCount: productCountMap[subcategory.id] || 0,
      categoryName: categoryMap[subcategory.categoryId] || "Unknown",
    }));

    return {
      data,
      pagination: {
        total: count,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return { error: "Failed to fetch subcategories" };
  }
}

// Get subcategories by category ID
export async function getSubcategoriesByCategoryId(categoryId: string) {
  try {
    const data = await db.query.subcategories.findMany({
      where: eq(subcategories.categoryId, categoryId),
      orderBy: [subcategories.name],
    });
    return { data };
  } catch (error) {
    return { error: "Failed to fetch subcategories" };
  }
}

// Get a single subcategory by ID
export async function getSubcategoryById(id: string) {
  try {
    const subcategory = await db.query.subcategories.findFirst({
      where: eq(subcategories.id, id),
      with: {
        category: true,
      },
    });

    return subcategory;
  } catch (error) {
    console.error(`Error fetching subcategory with ID ${id}:`, error);
    throw new Error("Failed to fetch subcategory");
  }
}

// Create a new subcategory
export async function createSubcategory(data: SubcategoryFormValues) {
  try {
    // Validate data
    const validatedData = subcategorySchema.parse(data);

    // Check if slug exists
    const existingSubcategory = await db.query.subcategories.findFirst({
      where: eq(subcategories.slug, validatedData.slug),
    });

    if (existingSubcategory) {
      return { error: "A subcategory with this slug already exists" };
    }

    // Create new subcategory
    const newSubcategory = {
      id: createId(),
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      categoryId: validatedData.categoryId,
    };

    await db.insert(subcategories).values(newSubcategory);

    revalidatePath("/admin/subcategories");

    return { success: true, subcategory: newSubcategory };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error creating subcategory:", error);
    return { error: "Failed to create subcategory" };
  }
}

// Update a subcategory
export async function updateSubcategory(
  id: string,
  data: SubcategoryFormValues
) {
  try {
    // Validate data
    const validatedData = subcategorySchema.parse(data);

    // Check if subcategory exists
    const existingSubcategory = await db.query.subcategories.findFirst({
      where: eq(subcategories.id, id),
    });

    if (!existingSubcategory) {
      return { error: "Subcategory not found" };
    }

    // Check if slug exists (if changed)
    if (validatedData.slug !== existingSubcategory.slug) {
      const slugExists = await db.query.subcategories.findFirst({
        where: eq(subcategories.slug, validatedData.slug),
      });

      if (slugExists) {
        return { error: "A subcategory with this slug already exists" };
      }
    }

    // Update subcategory
    await db
      .update(subcategories)
      .set({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        categoryId: validatedData.categoryId,
        updatedAt: new Date(),
      })
      .where(eq(subcategories.id, id));

    revalidatePath("/admin/subcategories");

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error updating subcategory:", error);
    return { error: "Failed to update subcategory" };
  }
}

// Delete a subcategory
export async function deleteSubcategory(id: string) {
  try {
    // Check if subcategory exists and get associated products
    const subcategoryProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.subcategoryId, id));

    const productCount = subcategoryProducts.length;

    // Delete subcategory
    await db.delete(subcategories).where(eq(subcategories.id, id));

    // Update any associated products to remove the subcategory
    if (productCount > 0) {
      await db
        .update(products)
        .set({ subcategoryId: null })
        .where(eq(products.subcategoryId, id));
    }

    revalidatePath("/admin/subcategories");

    return { success: true, productCount };
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return { error: "Failed to delete subcategory" };
  }
}
