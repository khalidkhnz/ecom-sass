"use server";

import { db } from "@/lib/db";
import { vendors } from "@/schema/products";
import { products } from "@/schema/products";
import { createId } from "@paralleldrive/cuid2";
import { eq, sql, count, and, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for vendor validation
export const vendorSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
  logo: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  status: z.enum(["pending", "active", "suspended"]).default("pending"),
  commissionRate: z.coerce
    .number()
    .min(0, { message: "Commission rate must be at least 0%" })
    .max(100, { message: "Commission rate cannot exceed 100%" })
    .default(10),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;

// Get all vendors
export async function getVendors(params?: {
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
        id: vendors.id,
        name: vendors.name,
        slug: vendors.slug,
        description: vendors.description,
        logo: vendors.logo,
        email: vendors.email,
        phone: vendors.phone,
        address: vendors.address,
        status: vendors.status,
        commissionRate: vendors.commissionRate,
        createdAt: vendors.createdAt,
        updatedAt: vendors.updatedAt,
      })
      .from(vendors);

    // Apply search filter if provided
    const filteredQuery = search
      ? queryBuilder.where(
          sql`(${vendors.name} LIKE ${`%${search}%`} OR ${
            vendors.slug
          } LIKE ${`%${search}%`})`
        )
      : queryBuilder;

    // Get total count for pagination
    const countQuery = search
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(vendors)
          .where(
            sql`(${vendors.name} LIKE ${`%${search}%`} OR ${
              vendors.slug
            } LIKE ${`%${search}%`})`
          )
      : db.select({ count: sql<number>`count(*)` }).from(vendors);

    const [{ count }] = await countQuery;
    const totalPages = Math.ceil(count / limit);

    // Apply pagination
    const allVendors = await filteredQuery
      .orderBy(vendors.name)
      .limit(limit)
      .offset(offset);

    // Get product counts for each vendor
    const productCounts = await db
      .select({
        vendorId: products.vendorId,
        count: sql<number>`count(${products.id})`,
      })
      .from(products)
      .groupBy(products.vendorId);

    // Create a map of vendor ID to product count
    const productCountMap = productCounts.reduce((acc, { vendorId, count }) => {
      if (vendorId) {
        acc[vendorId] = count;
      }
      return acc;
    }, {} as Record<string, number>);

    // Combine the data
    const data = allVendors.map((vendor) => ({
      ...vendor,
      productCount: productCountMap[vendor.id] || 0,
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
    console.error("Error fetching vendors:", error);
    return { error: "Failed to fetch vendors" };
  }
}

// Get a single vendor by ID
export async function getVendorById(id: string) {
  try {
    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.id, id),
    });

    return vendor;
  } catch (error) {
    console.error(`Error fetching vendor with ID ${id}:`, error);
    throw new Error("Failed to fetch vendor");
  }
}

// Get a single vendor by slug
export async function getVendorBySlug(slug: string) {
  try {
    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.slug, slug),
    });

    if (!vendor) {
      return null;
    }

    return vendor;
  } catch (error) {
    console.error(`Error fetching vendor with slug ${slug}:`, error);
    throw new Error("Failed to fetch vendor");
  }
}

// Create a new vendor
export async function createVendor(data: VendorFormValues) {
  try {
    // Validate data
    const validatedData = vendorSchema.parse(data);

    // Check if slug exists
    const existingVendor = await db.query.vendors.findFirst({
      where: eq(vendors.slug, validatedData.slug),
    });

    if (existingVendor) {
      return { error: "A vendor with this slug already exists" };
    }

    // Create new vendor
    const newVendor = {
      id: createId(),
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || "",
      logo: validatedData.logo || "",
      email: validatedData.email,
      phone: validatedData.phone || "",
      address: validatedData.address || {},
      status: validatedData.status,
      commissionRate: String(validatedData.commissionRate),
    };

    await db.insert(vendors).values(newVendor);

    revalidatePath("/admin/vendors");

    return { success: true, vendor: newVendor };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error creating vendor:", error);
    return { error: "Failed to create vendor" };
  }
}

// Update a vendor
export async function updateVendor(id: string, data: VendorFormValues) {
  try {
    // Validate data
    const validatedData = vendorSchema.parse(data);

    // Check if vendor exists
    const existingVendor = await db.query.vendors.findFirst({
      where: eq(vendors.id, id),
    });

    if (!existingVendor) {
      return { error: "Vendor not found" };
    }

    // Check if slug exists (if changed)
    if (validatedData.slug !== existingVendor.slug) {
      const slugExists = await db.query.vendors.findFirst({
        where: eq(vendors.slug, validatedData.slug),
      });

      if (slugExists) {
        return { error: "A vendor with this slug already exists" };
      }
    }

    // Update vendor
    await db
      .update(vendors)
      .set({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || "",
        logo: validatedData.logo || "",
        email: validatedData.email,
        phone: validatedData.phone || "",
        address: validatedData.address || {},
        status: validatedData.status,
        commissionRate: String(validatedData.commissionRate),
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, id));

    revalidatePath("/admin/vendors");

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error updating vendor:", error);
    return { error: "Failed to update vendor" };
  }
}

// Delete a vendor
export async function deleteVendor(id: string) {
  try {
    // Check if vendor exists and get associated products
    const vendorProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.vendorId, id));

    const productCount = vendorProducts.length;

    // Delete vendor
    await db.delete(vendors).where(eq(vendors.id, id));

    // Update any associated products to remove the vendor
    if (productCount > 0) {
      await db
        .update(products)
        .set({ vendorId: null })
        .where(eq(products.vendorId, id));
    }

    revalidatePath("/admin/vendors");

    return { success: true, productCount };
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return { error: "Failed to delete vendor" };
  }
}

// Update vendor status
export async function updateVendorStatus(
  id: string,
  status: "pending" | "active" | "suspended"
) {
  try {
    await db
      .update(vendors)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, id));

    revalidatePath("/admin/vendors");

    return { success: true };
  } catch (error) {
    console.error("Error updating vendor status:", error);
    return { error: "Failed to update vendor status" };
  }
}
