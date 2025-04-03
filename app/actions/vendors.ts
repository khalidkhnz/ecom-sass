"use server";

import { db } from "@/lib/db";
import { vendors } from "@/schema/products";
import { createId } from "@paralleldrive/cuid2";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for vendor validation
const vendorSchema = z.object({
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
export async function getVendors() {
  try {
    const allVendors = await db
      .select()
      .from(vendors)
      .orderBy(desc(vendors.createdAt));

    return allVendors;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw new Error("Failed to fetch vendors");
  }
}

// Get a single vendor by ID
export async function getVendorById(id: string) {
  try {
    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.id, id),
    });

    if (!vendor) {
      return null;
    }

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

    const slugExists = await db.query.vendors.findFirst({
      where: eq(vendors.slug, validatedData.slug),
    });

    if (slugExists) {
      return { error: "A vendor with this slug already exists" };
    }

    // Create new vendor ID
    const id = createId();

    // Create vendor
    await db.insert(vendors).values({
      id,
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      logo: validatedData.logo || null,
      email: validatedData.email,
      phone: validatedData.phone || null,
      address: validatedData.address || {},
      status: validatedData.status,
      commissionRate: String(validatedData.commissionRate),
    });

    revalidatePath("/admin/vendors");

    return {
      success: true,
      vendorId: id,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error creating vendor:", error);
    return { error: "Failed to create vendor" };
  }
}

// Update an existing vendor
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

    // Check slug if changed
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
        description: validatedData.description || null,
        logo: validatedData.logo || null,
        email: validatedData.email,
        phone: validatedData.phone || null,
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
    // Delete vendor
    await db.delete(vendors).where(eq(vendors.id, id));

    revalidatePath("/admin/vendors");

    return { success: true };
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
