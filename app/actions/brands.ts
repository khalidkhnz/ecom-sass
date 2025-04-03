"use server";

import { db } from "@/lib/db";
import { brands } from "@/schema/products";
import { createId } from "@paralleldrive/cuid2";
import { eq, desc } from "drizzle-orm";
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
  website: z.string().url().optional(),
  featured: z.boolean().default(false),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

// Get all brands
export async function getBrands() {
  try {
    const allBrands = await db
      .select()
      .from(brands)
      .orderBy(desc(brands.createdAt));

    return allBrands;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw new Error("Failed to fetch brands");
  }
}

// Get a single brand by ID
export async function getBrandById(id: string) {
  try {
    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, id),
    });

    if (!brand) {
      return null;
    }

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

    const slugExists = await db.query.brands.findFirst({
      where: eq(brands.slug, validatedData.slug),
    });

    if (slugExists) {
      return { error: "A brand with this slug already exists" };
    }

    // Create new brand ID
    const id = createId();

    // Create brand
    await db.insert(brands).values({
      id,
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      logo: validatedData.logo || null,
      website: validatedData.website || null,
      featured: validatedData.featured,
    });

    revalidatePath("/admin/brands");

    return {
      success: true,
      brandId: id,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error creating brand:", error);
    return { error: "Failed to create brand" };
  }
}

// Update an existing brand
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

    // Check slug if changed
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
        website: validatedData.website || null,
        featured: validatedData.featured,
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
    // Delete brand
    await db.delete(brands).where(eq(brands.id, id));

    revalidatePath("/admin/brands");

    return { success: true };
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
