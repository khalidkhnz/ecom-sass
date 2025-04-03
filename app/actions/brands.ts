"use server";

import { db } from "@/lib/db";
import { brands } from "@/schema/products";
import { products } from "@/schema/products";
import { createId } from "@paralleldrive/cuid2";
import { eq, sql, count, and, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for brand validation
const brandSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
  logo: z.string().optional(),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

// Get all brands
export async function getBrands(params?: {
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
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        description: brands.description,
        logo: brands.logo,
        createdAt: brands.createdAt,
        updatedAt: brands.updatedAt,
      })
      .from(brands);

    // Apply search filter if provided
    const filteredQuery = search
      ? queryBuilder.where(
          sql`(${brands.name} LIKE ${`%${search}%`} OR ${
            brands.slug
          } LIKE ${`%${search}%`})`
        )
      : queryBuilder;

    // Get total count for pagination
    const countQuery = search
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(brands)
          .where(
            sql`(${brands.name} LIKE ${`%${search}%`} OR ${
              brands.slug
            } LIKE ${`%${search}%`})`
          )
      : db.select({ count: sql<number>`count(*)` }).from(brands);

    const [{ count }] = await countQuery;
    const totalPages = Math.ceil(count / limit);

    // Apply pagination
    const allBrands = await filteredQuery
      .orderBy(brands.name)
      .limit(limit)
      .offset(offset);

    // Get product counts for each brand
    const productCounts = await db
      .select({
        brandId: products.brandId,
        count: sql<number>`count(${products.id})`,
      })
      .from(products)
      .groupBy(products.brandId);

    // Create a map of brand ID to product count
    const productCountMap = productCounts.reduce((acc, { brandId, count }) => {
      if (brandId) {
        acc[brandId] = count;
      }
      return acc;
    }, {} as Record<string, number>);

    // Combine the data
    const data = allBrands.map((brand) => ({
      ...brand,
      productCount: productCountMap[brand.id] || 0,
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
    console.error("Error fetching brands:", error);
    return { error: "Failed to fetch brands" };
  }
}

// Get a single brand by ID
export async function getBrandById(id: string) {
  try {
    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, id),
    });

    return brand;
  } catch (error) {
    console.error(`Error fetching brand with ID ${id}:`, error);
    throw new Error("Failed to fetch brand");
  }
}

// Get a single brand by slug
export async function getBrandBySlug(slug: string) {
  try {
    const brand = await db.query.brands.findFirst({
      where: eq(brands.slug, slug),
    });

    if (!brand) {
      return null;
    }

    return brand;
  } catch (error) {
    console.error(`Error fetching brand with slug ${slug}:`, error);
    throw new Error("Failed to fetch brand");
  }
}

// Create a new brand
export async function createBrand(data: BrandFormValues) {
  try {
    // Validate data
    const validatedData = brandSchema.parse(data);

    // Check if slug exists
    const existingBrand = await db.query.brands.findFirst({
      where: eq(brands.slug, validatedData.slug),
    });

    if (existingBrand) {
      return { error: "A brand with this slug already exists" };
    }

    // Create new brand
    const newBrand = {
      id: createId(),
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      logo: validatedData.logo || null,
    };

    await db.insert(brands).values(newBrand);

    revalidatePath("/admin/brands");

    return { success: true, brand: newBrand };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error creating brand:", error);
    return { error: "Failed to create brand" };
  }
}

// Update a brand
export async function updateBrand(id: string, data: BrandFormValues) {
  try {
    // Validate data
    const validatedData = brandSchema.parse(data);

    // Check if brand exists
    const existingBrand = await db.query.brands.findFirst({
      where: eq(brands.id, id),
    });

    if (!existingBrand) {
      return { error: "Brand not found" };
    }

    // Check if slug exists (if changed)
    if (validatedData.slug !== existingBrand.slug) {
      const slugExists = await db.query.brands.findFirst({
        where: eq(brands.slug, validatedData.slug),
      });

      if (slugExists) {
        return { error: "A brand with this slug already exists" };
      }
    }

    // Update brand
    await db
      .update(brands)
      .set({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        logo: validatedData.logo || null,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, id));

    revalidatePath("/admin/brands");

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error updating brand:", error);
    return { error: "Failed to update brand" };
  }
}

// Delete a brand
export async function deleteBrand(id: string) {
  try {
    // Check if brand exists and get associated products
    const brandProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.brandId, id));

    const productCount = brandProducts.length;

    // Delete brand
    await db.delete(brands).where(eq(brands.id, id));

    // Update any associated products to remove the brand
    if (productCount > 0) {
      await db
        .update(products)
        .set({ brandId: null })
        .where(eq(products.brandId, id));
    }

    revalidatePath("/admin/brands");

    return { success: true, productCount };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return { error: "Failed to delete brand" };
  }
}

// Toggle brand featured status
export async function toggleBrandFeatured(id: string, featured: boolean) {
  try {
    await db
      .update(brands)
      .set({
        featured: !featured,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, id));

    revalidatePath("/admin/brands");

    return { success: true };
  } catch (error) {
    console.error("Error toggling brand featured status:", error);
    return { error: "Failed to update brand" };
  }
}
