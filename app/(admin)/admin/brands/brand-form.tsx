"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import {
  BrandFormValues,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/app/actions/brands";
import { Brand } from "@/schema/products";

// Form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  featured: z.boolean(),
});

interface BrandFormProps {
  initialData?: Brand | null;
}

export function BrandForm({ initialData }: BrandFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const isEditing = !!initialData;

  // Form definition
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      logo: "",
      website: "",
      featured: false,
    },
  });

  // Reset form when initialData is loaded
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || "",
        logo: initialData.logo || "",
        website: initialData.website || "",
        featured: !!initialData.featured,
      });
    }
  }, [initialData, form]);

  // Generate slug from brand name
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

  // Handle form submission
  const onSubmit = async (data: BrandFormValues) => {
    try {
      setLoading(true);

      if (isEditing) {
        const result = await updateBrand(initialData!.id, data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Brand updated");
      } else {
        const result = await createBrand(data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Brand created");
        router.push("/admin/brands");
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
        await deleteBrand(initialData.id);
        toast.success("Brand deleted successfully");
        router.push("/admin/brands");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

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
          title={isEditing ? "Edit Brand" : "Create Brand"}
          description={
            isEditing
              ? "Make changes to your brand"
              : "Add a new brand to your store"
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
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Brand name"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!isEditing) {
                            generateSlug();
                          }
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
                        placeholder="brand-slug"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The URL-friendly identifier for this brand
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
                        Featured brands are displayed prominently on your store
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={loading}
                        placeholder="Brand description"
                        className="h-32"
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
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="https://example.com/logo.png"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to your brand's logo image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="https://example.com"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Your brand's website URL</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {isEditing ? "Save changes" : "Create brand"}
          </Button>
        </form>
      </Form>
    </>
  );
}
