"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash, Plus, Minus, Copy, Tag, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import type { ProductFormValues } from "@/app/actions/products";
import { Product } from "@/schema/products";
import { useProduct } from "@/hooks/useProduct";
import { getBrands } from "@/app/actions/products";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  shortDescription: z.string().optional(),
  sku: z.string().min(1, { message: "SKU is required" }),
  barcode: z.string().optional(),
  price: z.coerce
    .number()
    .positive({ message: "Price must be a positive number" }),
  costPrice: z.coerce
    .number()
    .nonnegative({ message: "Cost price must be a non-negative number" })
    .optional(),
  discountPrice: z.coerce
    .number()
    .nonnegative({ message: "Discount price must be a non-negative number" })
    .optional(),
  discountStart: z.date().optional().nullable(),
  discountEnd: z.date().optional().nullable(),
  inventory: z.coerce
    .number()
    .int()
    .nonnegative({ message: "Inventory must be a non-negative integer" }),
  lowStockThreshold: z.coerce
    .number()
    .int()
    .nonnegative({
      message: "Low stock threshold must be a non-negative integer",
    })
    .optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  vendorId: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]),
  featured: z.boolean(),
  visibility: z.boolean().default(true),
  taxable: z.boolean().default(true),
  taxClass: z.string().optional(),
  weight: z.coerce.number().optional(),
  dimensions: z
    .object({
      length: z.coerce.number().optional(),
      width: z.coerce.number().optional(),
      height: z.coerce.number().optional(),
    })
    .optional(),
  shippingClass: z.string().optional(),
  isDigital: z.boolean().default(false),
  fileUrl: z.string().optional(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  attributes: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, { message: "Variant name is required" }),
        sku: z.string().min(1, { message: "Variant SKU is required" }),
        barcode: z.string().optional(),
        price: z.coerce.number().positive().optional(),
        inventory: z.coerce.number().int().nonnegative().optional(),
        options: z.record(z.string(), z.string()).optional(),
        images: z.array(z.string()).default([]),
        default: z.boolean().default(false),
      })
    )
    .optional(),
});

type FormValues = ProductFormValues;

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");
  const isEditing = !!productId;

  const { createProduct, updateProduct, deleteProduct } = useProducts();
  const { data: initialData, isLoading: isLoadingProduct } = useProduct(
    productId || ""
  );
  const { categories, isLoading: isLoadingCategories } = useCategories();

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandsData = await getBrands();
        setBrands(brandsData || []);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      }
    };

    fetchBrands();
  }, []);

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      sku: "",
      barcode: "",
      price: 0,
      costPrice: 0,
      discountPrice: undefined,
      discountStart: undefined,
      discountEnd: undefined,
      inventory: 0,
      lowStockThreshold: 5,
      categoryId: "",
      brandId: "",
      vendorId: "",
      status: "draft",
      featured: false,
      visibility: true,
      taxable: true,
      taxClass: "standard",
      weight: undefined,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      shippingClass: "standard",
      isDigital: false,
      fileUrl: "",
      images: [],
      tags: [],
      attributes: {} as Record<string, string | string[]>,
      metaTitle: "",
      metaDescription: "",
      variants: [],
    },
  });

  // Reset form when initialData is loaded
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || "",
        shortDescription: initialData.shortDescription || "",
        sku: initialData.sku || "",
        barcode: initialData.barcode || "",
        price: Number(initialData.price),
        costPrice: initialData.costPrice
          ? Number(initialData.costPrice)
          : undefined,
        discountPrice: initialData.discountPrice
          ? Number(initialData.discountPrice)
          : undefined,
        discountStart: initialData.discountStart
          ? new Date(initialData.discountStart)
          : undefined,
        discountEnd: initialData.discountEnd
          ? new Date(initialData.discountEnd)
          : undefined,
        inventory:
          typeof initialData.inventory === "string"
            ? Number(initialData.inventory)
            : initialData.inventory,
        lowStockThreshold: initialData.lowStockThreshold
          ? typeof initialData.lowStockThreshold === "string"
            ? Number(initialData.lowStockThreshold)
            : initialData.lowStockThreshold
          : 5,
        categoryId: initialData.categoryId || "",
        brandId: initialData.brandId || "",
        vendorId: initialData.vendorId || "",
        status: initialData.status as "draft" | "active" | "archived",
        featured: initialData.featured,
        visibility:
          initialData.visibility !== undefined &&
          initialData.visibility !== null
            ? initialData.visibility
            : true,
        taxable:
          initialData.taxable !== undefined && initialData.taxable !== null
            ? initialData.taxable
            : true,
        taxClass: initialData.taxClass || "standard",
        weight: initialData.weight ? Number(initialData.weight) : undefined,
        dimensions: initialData.dimensions || {
          length: 0,
          width: 0,
          height: 0,
        },
        shippingClass: initialData.shippingClass || "standard",
        isDigital: initialData.isDigital || false,
        fileUrl: initialData.fileUrl || "",
        images: initialData.images || [],
        tags: initialData.tags || [],
        attributes: (initialData.attributes || {}) as Record<
          string,
          string | string[]
        >,
        metaTitle: initialData.metaTitle || "",
        metaDescription: initialData.metaDescription || "",
        variants: (initialData.variants || []).map((variant) => ({
          ...variant,
          default: variant.default === null ? false : variant.default,
          price: variant.price ? Number(variant.price) : undefined,
          inventory: variant.inventory ? Number(variant.inventory) : 0,
          images: variant.images || [],
          options: (variant.options || {}) as Record<string, string>,
        })),
      } as unknown as FormValues);
    }
  }, [initialData, form]);

  // Generate slug from product name
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

  // Handle tag management
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput) {
      e.preventDefault();
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(tagInput)) {
        form.setValue("tags", [...currentTags, tagInput]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    );
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      if (isEditing) {
        await updateProduct({
          id: productId!,
          data,
        });
        toast.success("Product updated");
      } else {
        await createProduct(data);
        toast.success("Product created");
        router.push("/admin/products");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
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
          <Tabs defaultValue="basic">
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
              <TabsTrigger value="attributes">
                Attributes & Categories
              </TabsTrigger>
              <TabsTrigger value="media">Media & SEO</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Delivery</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
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
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
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
                              Featured products are displayed prominently on
                              your store
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
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(field.value || []).map(
                              (tag: string, index: number) => (
                                <Badge
                                  key={`${tag}-${index}`}
                                  className="px-3 py-1"
                                >
                                  <span>{tag}</span>
                                  <X
                                    className="h-3 w-3 ml-2 cursor-pointer"
                                    onClick={() => handleRemoveTag(tag)}
                                  />
                                </Badge>
                              )
                            )}
                          </div>
                          <div className="flex items-center border rounded-md overflow-hidden">
                            <Input
                              disabled={loading}
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              placeholder="Add tag and press Enter"
                              className="flex-1"
                              onKeyDown={handleAddTag}
                            />
                          </div>
                        </div>
                        <FormDescription>
                          Tags help customers find your products
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="pricing">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
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
                              Featured products are displayed prominently on
                              your store
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="attributes">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Heading title="Attributes" size="sm" />
                    <FormField
                      control={form.control}
                      name="attributes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attributes</FormLabel>
                          <FormControl>
                            <Textarea
                              disabled={loading}
                              placeholder="Enter attributes (one per line)"
                              value={Object.entries(field.value || {})
                                .map(
                                  ([key, value]) =>
                                    `${key}: ${
                                      Array.isArray(value)
                                        ? value.join(", ")
                                        : value
                                    }`
                                )
                                .join("\n")}
                              onChange={(e) => {
                                const attributes = e.target.value
                                  .split("\n")
                                  .filter(Boolean)
                                  .reduce((acc, line) => {
                                    const [key, value] = line
                                      .split(":")
                                      .map((part) => part.trim());
                                    if (key && value) {
                                      acc[key] = value.includes(",")
                                        ? value.split(",").map((v) => v.trim())
                                        : value;
                                    }
                                    return acc;
                                  }, {} as Record<string, string | string[]>);
                                field.onChange(attributes);
                              }}
                              className="h-32"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter each attribute as "key: value" on a new line
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Heading title="Categories" size="sm" />
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
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
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
                </div>
              </div>
            </TabsContent>
            <TabsContent value="media">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Heading title="Meta Title" size="sm" />
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Product meta title"
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
                    <Heading title="Meta Description" size="sm" />
                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea
                              disabled={loading}
                              placeholder="Product meta description"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="shipping">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Heading title="Shipping Class" size="sm" />
                    <FormField
                      control={form.control}
                      name="shippingClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Class</FormLabel>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select shipping class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="express">Express</SelectItem>
                              <SelectItem value="overnight">
                                Overnight
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Heading title="Weight" size="sm" />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={loading}
                              placeholder="Weight in kg"
                              step="0.01"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="variants">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Heading title="Variants" size="sm" />
                    <FormField
                      control={form.control}
                      name="variants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variants</FormLabel>
                          <FormControl>
                            <Textarea
                              disabled={loading}
                              placeholder="Enter variants (one per line)"
                              value={(field.value || []).join("\n")}
                              onChange={(e) => {
                                const variants = e.target.value
                                  .split("\n")
                                  .filter(Boolean);
                                field.onChange(variants);
                              }}
                              className="h-32"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter each variant on a new line
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Heading title="Dimensions" size="sm" />
                    <FormField
                      control={form.control}
                      name="dimensions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dimensions</FormLabel>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <FormControl>
                                <Input
                                  type="number"
                                  disabled={loading}
                                  placeholder="Length"
                                  value={field.value?.length || 0}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    field.onChange({
                                      ...field.value,
                                      length: isNaN(value) ? 0 : value,
                                    });
                                  }}
                                />
                              </FormControl>
                              <FormDescription>Length (cm)</FormDescription>
                            </div>
                            <div>
                              <FormControl>
                                <Input
                                  type="number"
                                  disabled={loading}
                                  placeholder="Width"
                                  value={field.value?.width || 0}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    field.onChange({
                                      ...field.value,
                                      width: isNaN(value) ? 0 : value,
                                    });
                                  }}
                                />
                              </FormControl>
                              <FormDescription>Width (cm)</FormDescription>
                            </div>
                            <div>
                              <FormControl>
                                <Input
                                  type="number"
                                  disabled={loading}
                                  placeholder="Height"
                                  value={field.value?.height || 0}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    field.onChange({
                                      ...field.value,
                                      height: isNaN(value) ? 0 : value,
                                    });
                                  }}
                                />
                              </FormControl>
                              <FormDescription>Height (cm)</FormDescription>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <Button disabled={loading} className="ml-auto" type="submit">
            {isEditing ? "Save changes" : "Create product"}
          </Button>
        </form>
      </Form>
    </>
  );
}
