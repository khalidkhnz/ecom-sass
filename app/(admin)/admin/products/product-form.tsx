"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductFormValues } from "@/app/actions/products";
import { Product } from "@/schema/products";
import { useProduct } from "@/hooks/useProduct";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { Skeleton } from "@/components/ui/skeleton";

// Product form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
  price: z.coerce
    .number()
    .positive({ message: "Price must be a positive number" }),
  inventory: z.coerce
    .number()
    .int()
    .min(0, { message: "Inventory must be a non-negative integer" }),
  categoryId: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]),
  featured: z.boolean(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const isEditing = !!productId;

  const { createProduct, updateProduct, deleteProduct } = useProducts();
  const { data: initialData, isLoading: isLoadingProduct } = useProduct(
    productId || ""
  );
  const { categories, isLoading: isLoadingCategories } = useCategories();

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      inventory: 0,
      categoryId: "",
      status: "draft",
      featured: false,
      images: [],
      tags: [],
    },
  });

  // Reset form when initialData is loaded
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || "",
        price: Number(initialData.price),
        inventory: initialData.inventory,
        categoryId: initialData.category?.id || initialData.categoryId || "",
        status: initialData.status as "draft" | "active" | "archived",
        featured: initialData.featured,
        images: initialData.images || [],
        tags: initialData.tags || [],
      });
    }
  }, [initialData, form]);

  // Generate slug from name
  const onNameChange = (name: string) => {
    if (!isEditing) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      form.setValue("slug", slug);
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      if (isEditing && initialData?.id) {
        await updateProduct({
          id: initialData.id,
          data: data as ProductFormValues,
        });
        toast.success("Product updated successfully");
      } else {
        await createProduct(data as ProductFormValues);
        toast.success("Product created successfully");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const onDelete = async () => {
    try {
      setLoading(true);

      if (initialData?.id) {
        await deleteProduct(initialData.id);
        toast.success("Product deleted successfully");
        router.push("/admin/products");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  if (isEditing && !initialData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title={isEditing ? "Edit Product" : "Create Product"}
          description={
            isEditing
              ? "Make changes to your product"
              : "Add a new product to your store"
          }
        />
        {isEditing && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <Heading title="Basic Information" size="sm" />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Product name"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            onNameChange(e.target.value);
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
                        <Input
                          disabled={loading}
                          placeholder="product-slug"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The URL-friendly identifier for this product
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
                          disabled={loading}
                          placeholder="Product description"
                          {...field}
                          value={field.value || ""}
                        />
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
                      <Select
                        disabled={loading || isLoadingCategories}
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
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
              </div>

              <div className="space-y-4">
                <Heading title="Pricing & Inventory" size="sm" />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={loading}
                          placeholder="9.99"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inventory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={loading}
                          placeholder="10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Heading title="Visibility & Status" size="sm" />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Control whether this product is visible to customers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>
                          Featured products are displayed prominently on your
                          store
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <Heading title="Images" size="sm" />
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URLs</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={loading}
                          placeholder="Enter image URLs (one per line)"
                          value={(field.value || []).join("\n")}
                          onChange={(e) => {
                            const urls = e.target.value
                              .split("\n")
                              .filter(Boolean);
                            field.onChange(urls);
                          }}
                          className="h-32"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter each image URL on a new line
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Heading title="Tags" size="sm" />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Tags</FormLabel>
                    <div className="flex flex-col space-y-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {field.value.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-1.5"
                          >
                            {tag}
                            <button
                              type="button"
                              className="ml-2 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                const newTags = [...field.value];
                                newTags.splice(index, 1);
                                field.onChange(newTags);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add tag and press Enter"
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const input = e.currentTarget;
                              const value = input.value.trim();
                              if (value && !field.value.includes(value)) {
                                field.onChange([...field.value, value]);
                                input.value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <FormDescription>
                      Press Enter to add a tag. Tags help categorize and search
                      products.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {isEditing ? "Save changes" : "Create product"}
          </Button>
        </form>
      </Form>
    </>
  );
}
