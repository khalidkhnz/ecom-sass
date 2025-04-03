import { z } from "zod";

export const subcategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
});

export type SubcategoryFormData = z.infer<typeof subcategorySchema>;
