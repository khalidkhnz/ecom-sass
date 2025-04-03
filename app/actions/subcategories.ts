"use server";

import { db } from "@/lib/db";
import { subcategories } from "@/schema/subcategories";
import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type PgTableWithColumns } from "drizzle-orm/pg-core";
import { subcategorySchema, type SubcategoryFormData } from "@/zod/subcategory";

export async function getSubcategories() {
  try {
    const data = await db.query.subcategories.findMany({
      with: {
        category: true,
      },
      orderBy: [subcategories.createdAt],
    });
    return { data };
  } catch (error) {
    return { error: "Failed to fetch subcategories" };
  }
}

export async function getSubcategoryById(id: string) {
  try {
    const data = await db.query.subcategories.findFirst({
      where: eq(subcategories.id, id),
      with: {
        category: true,
      },
    });
    return { data };
  } catch (error) {
    return { error: "Failed to fetch subcategory" };
  }
}

export async function getSubcategoriesByCategoryId(categoryId: string) {
  try {
    const data = await db.query.subcategories.findMany({
      where: eq(subcategories.categoryId, categoryId),
      orderBy: [subcategories.name],
    });
    return { data };
  } catch (error) {
    return { error: "Failed to fetch subcategories" };
  }
}

export async function createSubcategory(formData: SubcategoryFormData) {
  try {
    const validatedFields = subcategorySchema.safeParse(formData);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { name, slug, description, categoryId } = validatedFields.data;

    const existingSubcategory = await db.query.subcategories.findFirst({
      where: eq(subcategories.slug, slug),
    });

    if (existingSubcategory) {
      return { error: "Subcategory with this slug already exists" };
    }

    await db.insert(subcategories).values({
      name,
      slug,
      description,
      categoryId,
    });

    revalidatePath("/admin/subcategories");
    return { success: "Subcategory created successfully" };
  } catch (error) {
    return { error: "Failed to create subcategory" };
  }
}

export async function updateSubcategory(
  id: string,
  formData: SubcategoryFormData
) {
  try {
    const validatedFields = subcategorySchema.safeParse(formData);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { name, slug, description, categoryId } = validatedFields.data;

    const existingSubcategory = await db.query.subcategories.findFirst({
      where: eq(subcategories.slug, slug),
    });

    if (existingSubcategory && existingSubcategory.id !== id) {
      return { error: "Subcategory with this slug already exists" };
    }

    await db
      .update(subcategories)
      .set({
        name,
        slug,
        description,
        categoryId,
        updatedAt: new Date(),
      })
      .where(eq(subcategories.id, id));

    revalidatePath("/admin/subcategories");
    return { success: "Subcategory updated successfully" };
  } catch (error) {
    return { error: "Failed to update subcategory" };
  }
}

export async function deleteSubcategory(id: string) {
  try {
    await db.delete(subcategories).where(eq(subcategories.id, id));
    revalidatePath("/admin/subcategories");
    return { success: "Subcategory deleted successfully" };
  } catch (error) {
    return { error: "Failed to delete subcategory" };
  }
}
