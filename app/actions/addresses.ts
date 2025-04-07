"use server";

import { createId } from "@paralleldrive/cuid2";
import { db } from "@/lib/db";
import { users, Address } from "@/schema/users";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  addressSchema,
  addAddressSchema,
  updateAddressSchema,
  deleteAddressSchema,
  setDefaultAddressSchema,
  type AddressInput,
  type UpdateAddressInput,
  type DeleteAddressInput,
  type SetDefaultAddressInput,
} from "@/zod/address";

// Helper to get current user ID
async function getUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be signed in to manage addresses");
  }

  return session.user.id;
}

// Helper to get user with addresses
async function getUserWithAddresses(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

// Get all addresses for current user
export async function getUserAddresses() {
  try {
    const userId = await getUserId();
    const user = await getUserWithAddresses(userId);

    return {
      addresses: user.addresses || [],
      defaultAddress:
        user.addresses?.find((address) => address.isDefault) || null,
    };
  } catch (error: any) {
    console.error("Error getting user addresses:", error);
    return {
      error: error.message || "Failed to get addresses",
      addresses: [],
      defaultAddress: null,
    };
  }
}

// Add a new address
export async function addAddress(input: AddressInput) {
  // Validate input
  const result = addAddressSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "Invalid address data",
      errors: result.error.format(),
    };
  }

  try {
    const userId = await getUserId();
    const user = await getUserWithAddresses(userId);

    // Generate ID for the new address
    const newAddress: Address = {
      ...result.data,
      id: createId(),
    };

    // If this is the first address or marked as default, set it as default
    if (user.addresses?.length === 0 || newAddress.isDefault) {
      newAddress.isDefault = true;

      // If this is a new default, remove default from other addresses
      if (user.addresses && user.addresses.length > 0) {
        user.addresses = user.addresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }));
      }
    }

    // Add new address to the user's addresses array
    const updatedAddresses = [...(user.addresses || []), newAddress];

    // Update the user record
    await db
      .update(users)
      .set({
        addresses: updatedAddresses,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/user/settings/addresses");

    return {
      success: true,
      message: "Address added successfully",
      address: newAddress,
    };
  } catch (error: any) {
    console.error("Error adding address:", error);
    return {
      success: false,
      message: error.message || "Failed to add address",
    };
  }
}

// Update an existing address
export async function updateAddress(input: UpdateAddressInput) {
  // Validate input
  const result = updateAddressSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "Invalid address data",
      errors: result.error.format(),
    };
  }

  try {
    const { addressId, address } = result.data;
    const userId = await getUserId();
    const user = await getUserWithAddresses(userId);

    // Find the address to update
    const addressIndex = user.addresses?.findIndex(
      (addr) => addr.id === addressId
    );

    if (addressIndex === undefined || addressIndex === -1) {
      return {
        success: false,
        message: "Address not found",
      };
    }

    // Create updated addresses array
    const updatedAddresses = [...(user.addresses || [])];

    // Check if setting this address as default
    if (address.isDefault && !updatedAddresses[addressIndex].isDefault) {
      // Set all addresses to non-default
      updatedAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Update the specific address
    updatedAddresses[addressIndex] = {
      ...updatedAddresses[addressIndex],
      ...address,
      id: addressId, // Ensure ID doesn't change
    };

    // Update the user record
    await db
      .update(users)
      .set({
        addresses: updatedAddresses,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/user/settings/addresses");

    return {
      success: true,
      message: "Address updated successfully",
      address: updatedAddresses[addressIndex],
    };
  } catch (error: any) {
    console.error("Error updating address:", error);
    return {
      success: false,
      message: error.message || "Failed to update address",
    };
  }
}

// Delete an address
export async function deleteAddress(input: DeleteAddressInput) {
  // Validate input
  const result = deleteAddressSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "Invalid address ID",
      errors: result.error.format(),
    };
  }

  try {
    const { addressId } = result.data;
    const userId = await getUserId();
    const user = await getUserWithAddresses(userId);

    // Find the address to delete
    const addressToDelete = user.addresses?.find(
      (addr) => addr.id === addressId
    );

    if (!addressToDelete) {
      return {
        success: false,
        message: "Address not found",
      };
    }

    // Filter out the address to delete
    const updatedAddresses = (user.addresses || []).filter(
      (addr) => addr.id !== addressId
    );

    // If the deleted address was the default, set a new default
    if (addressToDelete.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    // Update the user record
    await db
      .update(users)
      .set({
        addresses: updatedAddresses,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/user/settings/addresses");

    return {
      success: true,
      message: "Address deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting address:", error);
    return {
      success: false,
      message: error.message || "Failed to delete address",
    };
  }
}

// Set an address as default
export async function setDefaultAddress(input: SetDefaultAddressInput) {
  // Validate input
  const result = setDefaultAddressSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "Invalid address ID",
      errors: result.error.format(),
    };
  }

  try {
    const { addressId } = result.data;
    const userId = await getUserId();
    const user = await getUserWithAddresses(userId);

    // Check if address exists
    const addressExists = user.addresses?.some((addr) => addr.id === addressId);

    if (!addressExists) {
      return {
        success: false,
        message: "Address not found",
      };
    }

    // Update all addresses, setting the specified one as default
    const updatedAddresses = (user.addresses || []).map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));

    // Update the user record
    await db
      .update(users)
      .set({
        addresses: updatedAddresses,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/user/settings/addresses");

    return {
      success: true,
      message: "Default address updated successfully",
    };
  } catch (error: any) {
    console.error("Error setting default address:", error);
    return {
      success: false,
      message: error.message || "Failed to set default address",
    };
  }
}
