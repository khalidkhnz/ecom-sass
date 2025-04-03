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
import { useVendors } from "@/hooks/useVendors";
import { useBrands } from "@/hooks/useBrands";
import type { getProductById, ProductFormValues } from "@/app/actions/products";
import { Product } from "@/schema/products";
import { useProduct } from "@/hooks/useProduct";
import { useQuery } from "@tanstack/react-query";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

// Define form types
type FormValues = z.infer<typeof formSchema> & {
  labels?: string[];
};

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const isEditing = !!productId;

  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);

  const { createProduct, updateProduct, deleteProduct } = useProducts();
  const { data: initialData, isLoading: isLoadingProduct } = useProduct(
    productId || ""
  );
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const { vendors, isLoading: isLoadingVendors } = useVendors();
  const { brands, isLoading: isLoadingBrands } = useBrands();

  // Add form validation schema
  const FormSchema = formSchema;

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    mode: "onChange",
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
      labels: [],
      attributes: {} as Record<string, string | string[]>,
      metaTitle: "",
      metaDescription: "",
      variants: [],
    },
  });

  // Reset form when initialData is loaded
  useEffect(() => {
    if (initialData) {
      setIsLoadingInitialData(true);
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
        labels: initialData.labels || [],
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
      console.log(form.getValues());
      setIsLoadingInitialData(false);
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

  // Handle adding a tag when pressing Enter
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput) {
      e.preventDefault();
      const currentTags = form.getValues("tags");
      // Ensure we're working with an array
      const tagsArray = Array.isArray(currentTags) ? currentTags : [];

      if (!tagsArray.includes(tagInput)) {
        form.setValue("tags", [...tagsArray, tagInput] as string[]);
      }
      setTagInput("");
    }
  };

  // Handle removing a tag when clicking the X
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    // Ensure we're working with an array
    const tagsArray = Array.isArray(currentTags) ? currentTags : [];

    form.setValue(
      "tags",
      tagsArray.filter((t: string) => t !== tagToRemove) as string[]
    );
  };

  // Add debugging function
  useEffect(() => {
    // Log form validation errors when they occur
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Form validation errors:", form.formState.errors);
    }
  }, [form.formState.errors]);

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    try {
      console.log("Submitting form with data:", data);
      setLoading(true);

      // Make sure price and other numeric values are properly parsed
      const parsedData = {
        ...data,
        price:
          typeof data.price === "string" ? parseFloat(data.price) : data.price,
        costPrice: data.costPrice
          ? typeof data.costPrice === "string"
            ? parseFloat(data.costPrice)
            : data.costPrice
          : undefined,
        discountPrice: data.discountPrice
          ? typeof data.discountPrice === "string"
            ? parseFloat(data.discountPrice)
            : data.discountPrice
          : undefined,
        inventory:
          typeof data.inventory === "string"
            ? parseInt(data.inventory)
            : data.inventory,
        lowStockThreshold: data.lowStockThreshold
          ? typeof data.lowStockThreshold === "string"
            ? parseInt(data.lowStockThreshold)
            : data.lowStockThreshold
          : undefined,
      };

      // Validate required fields
      const requiredFields = {
        name: "Product name",
        slug: "Product slug",
        sku: "SKU",
        price: "Price",
      };

      // Check for missing required fields
      const missingFields = Object.entries(requiredFields).filter(
        ([field]) => !parsedData[field as keyof ProductFormValues]
      );

      if (missingFields.length > 0) {
        const missingFieldNames = missingFields
          .map(([_, label]) => label)
          .join(", ");
        toast.error(`Please fill in all required fields: ${missingFieldNames}`);
        setLoading(false);
        return;
      }

      if (isEditing) {
        const result = await updateProduct({
          id: productId!,
          data: parsedData,
        });

        if (result.error) {
          toast.error(result.error);
          setLoading(false);
          return;
        }

        toast.success("Product updated");
        router.push("/admin/products");
      } else {
        const result = await createProduct(parsedData);

        if (result.error) {
          toast.error(result.error);
          setLoading(false);
          return;
        }

        toast.success("Product created");
        router.push("/admin/products");
      }
    } catch (error: any) {
      console.error("Error submitting product form:", error);
      if (error.errors) {
        // Handle zod validation errors
        const firstError = error.errors[0];
        toast.error(firstError?.message || "Validation error");
      } else {
        toast.error(error?.message || "Something went wrong");
      }
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

  if (isLoadingInitialData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-20" />
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
                      name="shortDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description</FormLabel>
                          <FormControl>
                            <Textarea
                              disabled={loading}
                              placeholder="Brief product description for cards"
                              {...field}
                              value={field.value || ""}
                              className="h-20"
                            />
                          </FormControl>
                          <FormDescription>
                            A brief description shown on product cards
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU (Required)</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="SKU123"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Stock Keeping Unit - must be unique
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barcode</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="1234567890123"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            UPC, EAN, or other barcode
                          </FormDescription>
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

                    <FormField
                      control={form.control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <Select
                            disabled={loading || isLoadingBrands}
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brands?.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor</FormLabel>
                          <Select
                            disabled={loading || isLoadingVendors}
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a vendor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vendors?.map((vendor) => (
                                <SelectItem key={vendor.id} value={vendor.id}>
                                  {vendor.name}
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
                      name="costPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={loading}
                              placeholder="5.99"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your cost to purchase or produce this item
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={loading}
                              placeholder="7.99"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Special sale price (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="discountStart"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Discount Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={loading}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date <
                                    new Date(new Date().setHours(0, 0, 0, 0))
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When the discount should start
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="discountEnd"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Discount End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={loading}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date <
                                    new Date(new Date().setHours(0, 0, 0, 0))
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When the discount should end
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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

                    <FormField
                      control={form.control}
                      name="lowStockThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Low Stock Threshold</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={loading}
                              placeholder="5"
                              {...field}
                              value={field.value || 5}
                            />
                          </FormControl>
                          <FormDescription>
                            Number of items that triggers a low stock warning
                          </FormDescription>
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
                      name="costPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={loading}
                              placeholder="5.99"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your cost to purchase or produce this item
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={loading}
                              placeholder="7.99"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Special sale price (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="discountStart"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Discount Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={loading}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date <
                                    new Date(new Date().setHours(0, 0, 0, 0))
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When the discount should start
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="discountEnd"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Discount End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={loading}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date <
                                    new Date(new Date().setHours(0, 0, 0, 0))
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When the discount should end
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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

                    <FormField
                      control={form.control}
                      name="lowStockThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Low Stock Threshold</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={loading}
                              placeholder="5"
                              {...field}
                              value={field.value || 5}
                            />
                          </FormControl>
                          <FormDescription>
                            Number of items that triggers a low stock warning
                          </FormDescription>
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
                    <Heading title="Categories & Associations" size="sm" />
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

                    <FormField
                      control={form.control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <Select
                            disabled={loading || isLoadingBrands}
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brands?.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor</FormLabel>
                          <Select
                            disabled={loading || isLoadingVendors}
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a vendor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vendors?.map((vendor) => (
                                <SelectItem key={vendor.id} value={vendor.id}>
                                  {vendor.name}
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
              </div>
            </TabsContent>
            <TabsContent value="media">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Heading title="Images & Media" size="sm" />
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

                  <div className="space-y-4">
                    <Heading title="SEO Information" size="sm" />
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="SEO optimized title (for search engines)"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            The title shown in search engine results
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea
                              disabled={loading}
                              placeholder="SEO optimized description (for search engines)"
                              {...field}
                              value={field.value || ""}
                              className="h-20"
                            />
                          </FormControl>
                          <FormDescription>
                            The description shown in search engine results
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Heading title="Product Labels" size="sm" />
                    <FormField
                      control={form.control}
                      name="labels"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Labels</FormLabel>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              {[
                                "new",
                                "bestseller",
                                "featured",
                                "sale",
                                "limited",
                              ].map((label) => (
                                <FormItem
                                  key={label}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={
                                        Array.isArray(field.value) &&
                                        field.value.includes(label)
                                      }
                                      onCheckedChange={(checked) => {
                                        const currentLabels = Array.isArray(
                                          field.value
                                        )
                                          ? [...field.value]
                                          : [];
                                        if (checked) {
                                          field.onChange([
                                            ...currentLabels,
                                            label,
                                          ]);
                                        } else {
                                          field.onChange(
                                            currentLabels.filter(
                                              (l) => l !== label
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="capitalize">
                                      {label}
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              ))}
                            </div>
                          </div>
                          <FormDescription>
                            Special labels to highlight this product
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="digital">Digital</SelectItem>
                              <SelectItem value="heavy">Heavy</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <Heading title="Tax Settings" size="sm" />
                    <FormField
                      control={form.control}
                      name="taxable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Taxable</FormLabel>
                            <FormDescription>
                              Whether this product is subject to tax
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Class</FormLabel>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value || "standard"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tax class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="reduced">Reduced</SelectItem>
                              <SelectItem value="zero">Zero</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Tax classification for this product
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Heading title="Weight & Dimensions" size="sm" />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={loading}
                              placeholder="Weight in kg"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <Heading title="Digital Product" size="sm" />
                    <FormField
                      control={form.control}
                      name="isDigital"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Digital Product</FormLabel>
                            <FormDescription>
                              This is a digital product that doesn't require
                              shipping
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("isDigital") && (
                      <FormField
                        control={form.control}
                        name="fileUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Download URL</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="https://example.com/download/file.pdf"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Direct URL to the digital product file
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="visibility"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Visibility</FormLabel>
                            <FormDescription>
                              Make this product visible to customers
                            </FormDescription>
                          </div>
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
                    <Heading title="Product Variants" size="sm" />
                    {form?.watch("variants") &&
                      Array.isArray(form?.watch("variants")) &&
                      (form?.watch?.("variants")?.length || 0) > 0 && (
                        <div className="space-y-4">
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead>Stock</TableHead>
                                  <TableHead>Default</TableHead>
                                  <TableHead></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {form.watch("variants") &&
                                  form
                                    ?.watch("variants")
                                    ?.map((variant: any, index: number) => (
                                      <TableRow key={variant.id || index}>
                                        <TableCell>{variant.name}</TableCell>
                                        <TableCell>{variant.sku}</TableCell>
                                        <TableCell>
                                          {variant.price || "-"}
                                        </TableCell>
                                        <TableCell>
                                          {variant.inventory || "0"}
                                        </TableCell>
                                        <TableCell>
                                          <Checkbox
                                            checked={variant.default || false}
                                            onCheckedChange={(checked) => {
                                              const currentVariants =
                                                form.getValues("variants");
                                              if (!currentVariants) return;

                                              const variants = [
                                                ...currentVariants,
                                              ];

                                              // Update default status for this variant
                                              variants[index] = {
                                                ...variants[index],
                                                default: !!checked,
                                              };

                                              // If setting this one as default, unset others
                                              if (checked) {
                                                variants.forEach((v, i) => {
                                                  if (i !== index) {
                                                    variants[i] = {
                                                      ...variants[i],
                                                      default: false,
                                                    };
                                                  }
                                                });
                                              }

                                              form.setValue(
                                                "variants",
                                                variants
                                              );
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const currentVariants =
                                                form.getValues("variants");
                                              if (!currentVariants) return;

                                              const variants = [
                                                ...currentVariants,
                                              ];
                                              variants.splice(index, 1);
                                              form.setValue(
                                                "variants",
                                                variants
                                              );
                                            }}
                                          >
                                            <Trash className="w-4 h-4" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                    <Button
                      type="button"
                      onClick={() => {
                        const currentVariants = form.getValues("variants");
                        const variants = currentVariants
                          ? [...currentVariants]
                          : [];

                        variants.push({
                          name: "",
                          sku: "",
                          price: undefined,
                          inventory: 0,
                          default: variants.length === 0, // First variant is default
                          images: [],
                        });

                        form.setValue("variants", variants);

                        // Open a dialog to edit the new variant
                        // This would be implemented in a real application
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Variant
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Heading title="Variant Details" size="sm" />
                    <p className="text-sm text-muted-foreground">
                      Select a variant from the list to edit its details, or
                      click "Add Variant" to create a new one.
                    </p>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        Each variant must have a unique SKU. If a variant has a
                        price, it will override the main product price for that
                        variant.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <Button disabled={loading} className="ml-auto" type="submit">
            {loading ? (
              <span className="flex items-center gap-1">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {isEditing ? "Saving..." : "Creating..."}
              </span>
            ) : isEditing ? (
              "Save changes"
            ) : (
              "Create product"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
