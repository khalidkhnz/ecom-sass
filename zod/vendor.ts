import * as z from "zod";

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
