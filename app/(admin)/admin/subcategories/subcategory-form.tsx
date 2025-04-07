"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subcategorySchema } from "@/zod/subcategory";
import { type SubcategoryFormValues } from "@/zod/subcategory";
import { Category } from "@/schema/categories";
import { useRouter } from "next/navigation";
import {
  createSubcategory,
  updateSubcategory,
} from "@/app/actions/subcategories";
import { toast } from "sonner";

interface SubcategoryFormProps {
  initialData?: SubcategoryFormValues & { id?: string };
  categories: Category[];
}

export function SubcategoryForm({
  initialData,
  categories,
}: SubcategoryFormProps) {
  const router = useRouter();
  const form = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      categoryId: "",
    },
  });

  // Generate slug from subcategory name
  const generateSlug = () => {
    const name = form.watch("name");
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug);
    }
  };

  const onSubmit = async (data: SubcategoryFormValues) => {
    try {
      if (initialData?.id) {
        const result = await updateSubcategory(initialData.id, data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Subcategory updated successfully");
      } else {
        const result = await createSubcategory(data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Subcategory created successfully");
      }
      router.push("/admin/subcategories");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Subcategory name"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    generateSlug();
                  }}
                />
              </FormControl>
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
                <Input placeholder="subcategory-slug" {...field} />
              </FormControl>
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
                <Textarea placeholder="Subcategory description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {initialData ? "Update" : "Create"} Subcategory
        </Button>
      </form>
    </Form>
  );
}
