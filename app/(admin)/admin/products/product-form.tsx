"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useVendors } from "@/hooks/useVendors";
import { useBrands } from "@/hooks/useBrands";
import { useSubcategoriesByCategoryId } from "@/hooks/useSubcategories";
import type { ProductFormValues } from "@/app/actions/products";
import { useProduct } from "@/hooks/useProduct";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadFile } from "@/lib/upload";
import { getSubcategoriesByCategoryId } from "@/app/actions/subcategories";
import BasicInfoForm from "./basic-info-form";
import MediaAndSeoForm from "./media-and-seo-form";
import ShippingAndDeliveryForm from "./shipping-and-delivery-form";
import AddVariantDialog from "./add-variant-dialog";
import PricingAndInventoryForm from "./pricing-and-inventory";
import VariantsForm from "./variants-form";
import AttributesAndCategories from "./attributes-and-category";

export type SubcategoryArray = Awaited<
  ReturnType<typeof getSubcategoriesByCategoryId>
>["data"];

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
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  vendorId: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]),
  featured: z.boolean(),
  visibility: z.boolean().default(true),
  taxable: z.boolean().default(true),
  taxClass: z.string().optional(),
  taxRate: z.coerce
    .number()
    .min(0, { message: "Tax rate cannot be negative" })
    .optional(),
  taxType: z.enum(["vat", "gst", "sales", "service", "custom"]).default("vat"),
  taxDetails: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      includedInPrice: z.boolean().default(true),
    })
    .optional(),
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
  labels: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
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
export type FormValues = z.infer<typeof formSchema> & {
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
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [attributeName, setAttributeName] = useState("");
  const [attributeValue, setAttributeValue] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const { createProduct, updateProduct, deleteProduct } = useProducts();
  const { data: initialData, isLoading: isLoadingProduct } = useProduct(
    productId || ""
  );
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const { vendors, isLoading: isLoadingVendors } = useVendors();
  const { brands, isLoading: isLoadingBrands } = useBrands();

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
      subcategoryId: "",
      brandId: "",
      vendorId: "",
      status: "draft",
      featured: false,
      visibility: true,
      taxable: true,
      taxClass: "standard",
      taxRate: 0,
      taxType: "vat",
      taxDetails: {
        name: "",
        description: "",
        includedInPrice: true,
      },
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
      features: [],
      attributes: {} as Record<string, string | string[]>,
      metaTitle: "",
      metaDescription: "",
      variants: [],
    },
  });

  const selectedCategory = form.watch("categoryId") || "";

  const { data: subcategoriesData, isLoading: isLoadingSubcategories } =
    useSubcategoriesByCategoryId(selectedCategory);

  const subcategories = subcategoriesData?.data || [];

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
        subcategoryId: initialData.subcategoryId || "",
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
        taxRate: initialData.taxRate || 0,
        taxType: initialData.taxType || "vat",
        taxDetails: initialData.taxDetails || {
          name: "",
          description: "",
          includedInPrice: true,
        },
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
        features: initialData.features || [],
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

  // Handle image file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageUploadLoading(true);
    try {
      const currentImages = form.getValues("images") || [];
      const newImages = [...currentImages];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const fileUri = await uploadFile({ file, dir: "products" });
          newImages.push(fileUri);
        }
      }

      form.setValue("images", newImages);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setImageUploadLoading(false);
    }
  };

  // Handle adding image URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;

    const currentImages = form.getValues("images") || [];
    const newImages = [...currentImages, imageUrlInput.trim()];
    form.setValue("images", newImages);
    setImageUrlInput("");
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
          title={`Product: ${form.watch("name") || "Untitled"}`}
          description={`Description: ${
            form.watch("shortDescription") || "No short description"
          }`}
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
              <BasicInfoForm
                form={form}
                loading={loading}
                generateSlug={generateSlug}
                isLoadingCategories={isLoadingCategories}
                categories={categories}
                isLoadingBrands={isLoadingBrands}
                brands={brands}
                isLoadingVendors={isLoadingVendors}
                vendors={vendors}
                setFeatureInput={setFeatureInput}
                featureInput={featureInput}
                setImageUrlInput={setImageUrlInput}
                imageUrlInput={imageUrlInput}
                imageUploadLoading={imageUploadLoading}
                handleImageUpload={handleImageUpload}
                handleAddImageUrl={handleAddImageUrl}
                handleRemoveTag={handleRemoveTag}
                tagInput={tagInput}
                setTagInput={setTagInput}
                handleAddTag={handleAddTag}
                subcategories={subcategories || []}
                isLoadingSubcategories={isLoadingSubcategories}
              />
            </TabsContent>
            <TabsContent value="pricing">
              <PricingAndInventoryForm form={form} loading={loading} />
            </TabsContent>
            <TabsContent value="attributes">
              <AttributesAndCategories
                form={form}
                loading={loading}
                isLoadingCategories={isLoadingCategories}
                categories={categories}
                isLoadingBrands={isLoadingBrands}
                brands={brands}
                isLoadingVendors={isLoadingVendors}
                vendors={vendors}
                attributeName={attributeName}
                setAttributeName={setAttributeName}
                attributeValue={attributeValue}
                setAttributeValue={setAttributeValue}
                subcategories={subcategories || []}
                isLoadingSubcategories={isLoadingSubcategories}
              />
            </TabsContent>
            <TabsContent value="media">
              <MediaAndSeoForm
                form={form}
                loading={loading}
                handleRemoveTag={handleRemoveTag}
                tagInput={tagInput}
                setTagInput={setTagInput}
                handleAddTag={handleAddTag}
                handleAddImageUrl={handleAddImageUrl}
                imageUrlInput={imageUrlInput}
                imageUploadLoading={imageUploadLoading}
                handleImageUpload={handleImageUpload}
                setImageUrlInput={setImageUrlInput}
              />
            </TabsContent>
            <TabsContent value="shipping">
              <ShippingAndDeliveryForm form={form} loading={loading} />
            </TabsContent>
            <TabsContent value="variants">
              <VariantsForm form={form} loading={loading} />
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

      {/* Variant Edit Dialog */}
      <AddVariantDialog
        isVariantDialogOpen={isVariantDialogOpen}
        setIsVariantDialogOpen={setIsVariantDialogOpen}
        editingVariant={editingVariant}
        setEditingVariant={setEditingVariant}
        form={form}
      />
    </>
  );
}
