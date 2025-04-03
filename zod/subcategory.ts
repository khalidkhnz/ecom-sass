import { z } from "zod";

// Schema for subcategory validation
export const subcategorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
  categoryId: z.string().min(1, { message: "Category is required" }),
});

export type SubcategoryFormValues = z.infer<typeof subcategorySchema>;
