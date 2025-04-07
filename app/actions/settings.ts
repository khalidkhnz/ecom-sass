"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { settings } from "@/schema/settings";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorize";
import { z } from "zod";

// Define validation schemas
const generalSettingsSchema = z.object({
  siteName: z
    .string()
    .min(2, { message: "Site name must be at least 2 characters" }),
  siteUrl: z.string().url({ message: "Please enter a valid URL" }),
  adminEmail: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  enableNotifications: z.boolean().default(true),
  enableAnalytics: z.boolean().default(true),
});

const storeSettingsSchema = z.object({
  storeName: z
    .string()
    .min(2, { message: "Store name must be at least 2 characters" }),
  storeDescription: z.string().optional(),
  contactEmail: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  contactPhone: z.string().optional(),
  currency: z.string().min(1, { message: "Please select a currency" }),
  enableGuestCheckout: z.boolean().default(true),
  enableAutomaticTax: z.boolean().default(false),
  maxProductsPerOrder: z.number().int().positive().default(10),
  shippingFrom: z.string().optional(),
});

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;
export type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;

// Helper function to get current user with admin check
async function getCurrentUser() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return {
    ...session.user,
    isAdmin: session.user.role === "admin",
  };
}

// Get settings (for initial form values)
export async function getSettings() {
  try {
    const allSettings = await db.select().from(settings).limit(1);

    if (allSettings.length === 0) {
      return {
        general: {
          siteName: "Next Drizzle E-commerce",
          siteUrl: "https://example.com",
          adminEmail: "admin@example.com",
          enableNotifications: true,
          enableAnalytics: true,
        },
        store: {
          storeName: "My E-commerce Store",
          storeDescription: "Your one-stop shop for quality products",
          contactEmail: "store@example.com",
          contactPhone: "+1 (123) 456-7890",
          currency: "USD",
          enableGuestCheckout: true,
          enableAutomaticTax: false,
          maxProductsPerOrder: 10,
          shippingFrom: "United States",
        },
      };
    }

    const settingsData = allSettings[0];

    return {
      general: {
        siteName: settingsData.siteName || "Next Drizzle E-commerce",
        siteUrl: settingsData.siteUrl || "https://example.com",
        adminEmail: settingsData.adminEmail || "admin@example.com",
        enableNotifications: settingsData.enableNotifications ?? true,
        enableAnalytics: settingsData.enableAnalytics ?? true,
      },
      store: {
        storeName: settingsData.storeName || "My E-commerce Store",
        storeDescription:
          settingsData.storeDescription ||
          "Your one-stop shop for quality products",
        contactEmail: settingsData.contactEmail || "store@example.com",
        contactPhone: settingsData.contactPhone || "+1 (123) 456-7890",
        currency: settingsData.currency || "USD",
        enableGuestCheckout: settingsData.enableGuestCheckout ?? true,
        enableAutomaticTax: settingsData.enableAutomaticTax ?? false,
        maxProductsPerOrder: settingsData.maxProductsPerOrder || 10,
        shippingFrom: settingsData.shippingFrom || "United States",
      },
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw new Error("Failed to fetch settings");
  }
}

// Update general settings
export async function updateGeneralSettings(
  formData: GeneralSettingsFormValues
) {
  try {
    // Authorize admin access
    await authorize("admin");

    // Validate data
    const validatedData = generalSettingsSchema.parse(formData);

    // Check if settings exist
    const existingSettings = await db
      .select({ id: settings.id })
      .from(settings)
      .limit(1);

    if (existingSettings.length === 0) {
      // Create new settings
      await db.insert(settings).values({
        siteName: validatedData.siteName,
        siteUrl: validatedData.siteUrl,
        adminEmail: validatedData.adminEmail,
        enableNotifications: validatedData.enableNotifications,
        enableAnalytics: validatedData.enableAnalytics,
        updatedAt: new Date(),
      });
    } else {
      // Update existing settings
      await db
        .update(settings)
        .set({
          siteName: validatedData.siteName,
          siteUrl: validatedData.siteUrl,
          adminEmail: validatedData.adminEmail,
          enableNotifications: validatedData.enableNotifications,
          enableAnalytics: validatedData.enableAnalytics,
          updatedAt: new Date(),
        })
        .where(eq(settings.id, existingSettings[0].id));
    }

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating general settings:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }

    if (error instanceof Error && error.message === "unauthorized") {
      return {
        success: false,
        error: "You are not authorized to perform this action",
      };
    }

    return { success: false, error: "Failed to update general settings" };
  }
}

// Update store settings
export async function updateStoreSettings(formData: StoreSettingsFormValues) {
  try {
    // Authorize admin access
    await authorize("admin");

    // Validate data
    const validatedData = storeSettingsSchema.parse(formData);

    // Check if settings exist
    const existingSettings = await db
      .select({ id: settings.id })
      .from(settings)
      .limit(1);

    if (existingSettings.length === 0) {
      // Create new settings
      await db.insert(settings).values({
        storeName: validatedData.storeName,
        storeDescription: validatedData.storeDescription,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        currency: validatedData.currency,
        enableGuestCheckout: validatedData.enableGuestCheckout,
        enableAutomaticTax: validatedData.enableAutomaticTax,
        maxProductsPerOrder: validatedData.maxProductsPerOrder,
        shippingFrom: validatedData.shippingFrom,
        updatedAt: new Date(),
      });
    } else {
      // Update existing settings
      await db
        .update(settings)
        .set({
          storeName: validatedData.storeName,
          storeDescription: validatedData.storeDescription,
          contactEmail: validatedData.contactEmail,
          contactPhone: validatedData.contactPhone,
          currency: validatedData.currency,
          enableGuestCheckout: validatedData.enableGuestCheckout,
          enableAutomaticTax: validatedData.enableAutomaticTax,
          maxProductsPerOrder: validatedData.maxProductsPerOrder,
          shippingFrom: validatedData.shippingFrom,
          updatedAt: new Date(),
        })
        .where(eq(settings.id, existingSettings[0].id));
    }

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating store settings:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }

    if (error instanceof Error && error.message === "unauthorized") {
      return {
        success: false,
        error: "You are not authorized to perform this action",
      };
    }

    return { success: false, error: "Failed to update store settings" };
  }
}
