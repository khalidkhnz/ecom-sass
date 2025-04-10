"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { settings } from "@/schema/settings";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorize";
import { z } from "zod";
import { users } from "@/lib/schema";

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

// User notification settings schema
const userNotificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  orderUpdates: z.boolean().default(true),
  shippingUpdates: z.boolean().default(true),
  deliveryUpdates: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  productRecommendations: z.boolean().default(false),
  salesAndPromotions: z.boolean().default(false),
  backInStock: z.boolean().default(true),
  priceDrops: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
  accountActivity: z.boolean().default(true),
});

// Payment methods preferences schema
const paymentPreferencesSchema = z.object({
  saveNewMethods: z.boolean().default(true),
  oneClickCheckout: z.boolean().default(false),
});

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;
export type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;
export type UserNotificationSettingsFormValues = z.infer<
  typeof userNotificationSettingsSchema
>;
export type PaymentPreferencesFormValues = z.infer<
  typeof paymentPreferencesSchema
>;

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

// Get user notification settings
export async function getUserNotificationSettings() {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get the user from the database
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        id: true,
        notificationSettings: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Default settings if user has no saved preferences
    const defaultSettings = {
      emailNotifications: true,
      orderUpdates: true,
      shippingUpdates: true,
      deliveryUpdates: true,
      marketingEmails: false,
      productRecommendations: false,
      salesAndPromotions: false,
      backInStock: true,
      priceDrops: true,
      securityAlerts: true,
      accountActivity: true,
    };

    // Return user's saved notification settings or defaults
    return {
      success: true,
      settings: user.notificationSettings || defaultSettings,
    };
  } catch (error) {
    console.error("Error getting user notification settings:", error);
    return {
      success: false,
      error: "Failed to fetch notification settings",
    };
  }
}

// Update user notification settings
export async function updateUserNotificationSettings(
  formData: UserNotificationSettingsFormValues
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Validate data
    const validatedData = userNotificationSettingsSchema.parse(formData);

    // Update the user's notification settings
    await db
      .update(users)
      .set({
        notificationSettings: validatedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/user/settings/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error updating user notification settings:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }

    return {
      success: false,
      error: "Failed to update notification settings",
    };
  }
}

// Get user payment preferences
export async function getUserPaymentPreferences() {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get the user from the database
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        id: true,
        paymentPreferences: true,
        paymentMethods: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Default payment preferences if user has no saved preferences
    const defaultPreferences = {
      saveNewMethods: true,
      oneClickCheckout: false,
    };

    // Default empty payment methods if user has none
    const defaultPaymentMethods: any[] = [];

    // Return user's saved payment preferences or defaults
    return {
      success: true,
      preferences: user.paymentPreferences || defaultPreferences,
      paymentMethods: user.paymentMethods || defaultPaymentMethods,
    };
  } catch (error) {
    console.error("Error getting user payment preferences:", error);
    return {
      success: false,
      error: "Failed to fetch payment preferences",
    };
  }
}

// Update user payment preferences
export async function updateUserPaymentPreferences(
  formData: PaymentPreferencesFormValues
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Validate data
    const validatedData = paymentPreferencesSchema.parse(formData);

    // Update the user's payment preferences
    await db
      .update(users)
      .set({
        paymentPreferences: validatedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/user/settings/payment-methods");
    return { success: true };
  } catch (error) {
    console.error("Error updating user payment preferences:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }

    return {
      success: false,
      error: "Failed to update payment preferences",
    };
  }
}

// Save a payment method to the user's account
export async function saveUserPaymentMethod(paymentMethod: any) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get the user's current payment methods
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        id: true,
        paymentMethods: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Update the user's payment methods
    const existingMethods = user.paymentMethods || [];
    const updatedMethods = [...existingMethods, paymentMethod];

    // If this is the first payment method or it's marked as default, set it as default
    if (paymentMethod.isDefault || existingMethods.length === 0) {
      // Set all existing methods to not default
      updatedMethods.forEach((method, index) => {
        if (index < existingMethods.length) {
          method.isDefault = false;
        }
      });
    }

    await db
      .update(users)
      .set({
        paymentMethods: updatedMethods,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/user/settings/payment-methods");
    return { success: true };
  } catch (error) {
    console.error("Error saving payment method:", error);
    return {
      success: false,
      error: "Failed to save payment method",
    };
  }
}

// Delete a payment method from the user's account
export async function deleteUserPaymentMethod(methodId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get the user's current payment methods
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        id: true,
        paymentMethods: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const existingMethods = user.paymentMethods || [];
    const methodToDelete = existingMethods.find(
      (method) => method.id === methodId
    );

    if (!methodToDelete) {
      return {
        success: false,
        error: "Payment method not found",
      };
    }

    // Filter out the payment method to delete
    const updatedMethods = existingMethods.filter(
      (method) => method.id !== methodId
    );

    // If the deleted method was the default, set the first remaining method as default
    if (methodToDelete.isDefault && updatedMethods.length > 0) {
      updatedMethods[0].isDefault = true;
    }

    await db
      .update(users)
      .set({
        paymentMethods: updatedMethods,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/user/settings/payment-methods");
    return { success: true };
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return {
      success: false,
      error: "Failed to delete payment method",
    };
  }
}

// Update a payment method's default status
export async function setDefaultPaymentMethod(methodId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get the user's current payment methods
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        id: true,
        paymentMethods: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const existingMethods = user.paymentMethods || [];

    // Check if the method exists
    if (!existingMethods.some((method) => method.id === methodId)) {
      return {
        success: false,
        error: "Payment method not found",
      };
    }

    // Update all methods' default status
    const updatedMethods = existingMethods.map((method) => ({
      ...method,
      isDefault: method.id === methodId,
    }));

    await db
      .update(users)
      .set({
        paymentMethods: updatedMethods,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/user/settings/payment-methods");
    return { success: true };
  } catch (error) {
    console.error("Error setting default payment method:", error);
    return {
      success: false,
      error: "Failed to update default payment method",
    };
  }
}
