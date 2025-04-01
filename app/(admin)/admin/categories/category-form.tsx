"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useCategories, useCategory } from "@/hooks/useCategories";
import { CategoryFormValues } from "@/app/actions/categories";

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
});

interface CategoryFormProps {
  categoryId?: string;
}

export function CategoryForm({ categoryId }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!categoryId;

  const { createCategory, updateCategory } = useCategories();
  const { data: initialData, isLoading } = useCategory(categoryId || "");

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  // Set form values when initialData is loaded
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || "",
      });
    }
  }, [initialData, form]);

  // Generate slug from name (only when creating new)
  const generateSlug = (name: string) => {
    if (!isEditing) {
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      form.setValue("slug", slug);
    }
  };

  async function onSubmit(data: CategoryFormValues) {
    setLoading(true);

    try {
      if (isEditing && categoryId) {
        await updateCategory({ id: categoryId, data });
      } else {
        await createCategory(data);
      }
      router.push("/admin/categories");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (isEditing && isLoading) {
    return <div className="p-8 text-center">Loading category data...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Category name"
                  onChange={(e) => {
                    field.onChange(e);
                    generateSlug(e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription>
                The display name for the category
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="category-slug"
                  disabled={isEditing}
                />
              </FormControl>
              <FormDescription>
                The URL-friendly identifier (auto-generated from name)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe the category (optional)"
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                A brief description of the category
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categories")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Category"
              : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
