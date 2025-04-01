"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
}

export function CategoryForm({ initialData }: CategoryFormProps = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
    },
  });

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

  async function onSubmit(data: FormValues) {
    setLoading(true);

    try {
      // This would normally call a server action to save the category
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        isEditing
          ? "Category updated successfully"
          : "Category created successfully"
      );

      router.push("/admin/categories");
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update category" : "Failed to create category"
      );
    } finally {
      setLoading(false);
    }
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
