import { z } from "zod";

export const addressSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
  isDefault: z.boolean(),
});

export const addAddressSchema = addressSchema;

export const updateAddressSchema = z.object({
  addressId: z.string(),
  address: addressSchema,
});

export const deleteAddressSchema = z.object({
  addressId: z.string(),
});

export const setDefaultAddressSchema = z.object({
  addressId: z.string(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type DeleteAddressInput = z.infer<typeof deleteAddressSchema>;
export type SetDefaultAddressInput = z.infer<typeof setDefaultAddressSchema>;
