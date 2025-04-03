"use server";

import { db } from "@/lib/db";
import { productVariants, products } from "@/schema/products";
import { createId } from "@paralleldrive/cuid2";
import { eq, and, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for product variant validation
const variantSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  sku: z.string().min(1, { message: "SKU is required" }),
  barcode: z.string().optional(),
  price: z.coerce.number().nonnegative().optional(),
  inventory: z.coerce.number().int().nonnegative().optional(),
  options: z.record(z.string(), z.string()).optional(),
  images: z.array(z.string()).default([]),
  default: z.boolean().default(false),
});

export type VariantFormValues = z.infer<typeof variantSchema>;

// Get variants for a product
export async function getVariantsByProductId(productId: string) {
  try {
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    return variants;
  } catch (error) {
    console.error("Error fetching variants:", error);
    throw new Error("Failed to fetch variants");
  }
}

// Get a single variant by ID
export async function getVariantById(id: string) {
  try {
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, id),
    });

    if (!variant) {
      return null;
    }

    return variant;
  } catch (error) {
    console.error(`Error fetching variant with ID ${id}:`, error);
    throw new Error("Failed to fetch variant");
  }
}

// Create a new variant
export async function createVariant(data: VariantFormValues) {
  try {
    // Validate data
    const validatedData = variantSchema.parse(data);

    // Check if product exists
    const productExists = await db.query.products.findFirst({
      where: eq(products.id, validatedData.productId),
    });

    if (!productExists) {
      return { error: "Product not found" };
    }

    // Check SKU uniqueness
    const skuExists = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, validatedData.sku),
    });

    if (skuExists) {
      return { error: "A variant with this SKU already exists" };
    }

    // Create new variant ID
    const id = createId();

    // Create variant
    await db.insert(productVariants).values({
      id,
      productId: validatedData.productId,
      name: validatedData.name,
      sku: validatedData.sku,
      barcode: validatedData.barcode || null,
      price: validatedData.price ? String(validatedData.price) : null,
      inventory: validatedData.inventory
        ? String(validatedData.inventory)
        : "0",
      options: validatedData.options || {},
      images: validatedData.images,
      default: validatedData.default,
    });

    // If this is the default variant, update other variants to non-default
    if (validatedData.default) {
      await db
        .update(productVariants)
        .set({ default: false })
        .where(
          and(
            eq(productVariants.productId, validatedData.productId),
            ne(productVariants.id, id)
          )
        );
    }

    revalidatePath(`/admin/products/${validatedData.productId}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      variantId: id,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error creating variant:", error);
    return { error: "Failed to create variant" };
  }
}

// Update an existing variant
export async function updateVariant(id: string, data: VariantFormValues) {
  try {
    // Validate data
    const validatedData = variantSchema.parse(data);

    // Check if variant exists
    const existingVariant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, id),
    });

    if (!existingVariant) {
      return { error: "Variant not found" };
    }

    // Check SKU if changed
    if (validatedData.sku !== existingVariant.sku) {
      const skuExists = await db.query.productVariants.findFirst({
        where: and(
          eq(productVariants.sku, validatedData.sku),
          ne(productVariants.id, id)
        ),
      });

      if (skuExists) {
        return { error: "A variant with this SKU already exists" };
      }
    }

    // Update variant
    await db
      .update(productVariants)
      .set({
        name: validatedData.name,
        sku: validatedData.sku,
        barcode: validatedData.barcode || null,
        price: validatedData.price ? String(validatedData.price) : null,
        inventory: validatedData.inventory
          ? String(validatedData.inventory)
          : "0",
        options: validatedData.options || {},
        images: validatedData.images,
        default: validatedData.default,
        updatedAt: new Date(),
      })
      .where(eq(productVariants.id, id));

    // If this is the default variant, update other variants to non-default
    if (validatedData.default) {
      await db
        .update(productVariants)
        .set({ default: false })
        .where(
          and(
            eq(productVariants.productId, validatedData.productId),
            ne(productVariants.id, id)
          )
        );
    }

    revalidatePath(`/admin/products/${validatedData.productId}`);
    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error updating variant:", error);
    return { error: "Failed to update variant" };
  }
}

// Delete a variant
export async function deleteVariant(id: string) {
  try {
    // Get product ID for revalidation
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, id),
    });

    if (!variant) {
      return { error: "Variant not found" };
    }

    // Delete variant
    await db.delete(productVariants).where(eq(productVariants.id, id));

    revalidatePath(`/admin/products/${variant.productId}`);
    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    console.error("Error deleting variant:", error);
    return { error: "Failed to delete variant" };
  }
}

// Bulk update variants
export async function bulkUpdateVariants(
  productId: string,
  variants: Array<VariantFormValues & { id?: string }>
) {
  try {
    // Validate product exists
    const productExists = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!productExists) {
      return { error: "Product not found" };
    }

    // Get existing variants
    const existingVariants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    const existingVariantIds = existingVariants.map((v) => v.id);
    const variantIdsToKeep = variants
      .filter((v) => v.id)
      .map((v) => v.id as string);
    const variantIdsToDelete = existingVariantIds.filter(
      (id) => !variantIdsToKeep.includes(id)
    );

    // Delete variants that are no longer needed
    if (variantIdsToDelete.length > 0) {
      await db
        .delete(productVariants)
        .where(inArray(productVariants.id, variantIdsToDelete));
    }

    // Update or insert variants
    for (const variant of variants) {
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
            images: variant.images,
            default: variant.default,
            updatedAt: new Date(),
          })
          .where(eq(productVariants.id, variant.id));
      } else {
        // Insert new variant
        const newId = createId();
        await db.insert(productVariants).values({
          id: newId,
          productId,
          name: variant.name,
          sku: variant.sku,
          barcode: variant.barcode || null,
          price: variant.price ? String(variant.price) : null,
          inventory: variant.inventory ? String(variant.inventory) : "0",
          options: variant.options || {},
          images: variant.images,
          default: variant.default,
        });
      }
    }

    // Ensure only one variant is default
    const defaultVariants = variants.filter((v) => v.default);
    if (defaultVariants.length > 1) {
      // Make only the first one default
      const firstDefaultId = defaultVariants[0].id;
      if (firstDefaultId) {
        // Set all other variants to non-default
        await db
          .update(productVariants)
          .set({ default: false })
          .where(
            and(
              eq(productVariants.productId, productId),
              ne(productVariants.id, firstDefaultId)
            )
          );
      }
    }

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    console.error("Error updating variants:", error);
    return { error: "Failed to update variants" };
  }
}
