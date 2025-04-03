"use client";

import { FormDescription } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormControl } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import { FormItem } from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Category } from "@/schema/categories";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import ImagesUploader from "./images-uploader";
import { FormValues, SubcategoryArray } from "./product-form";
import { getBrands } from "@/app/actions/brands";
import { getVendors } from "@/app/actions/vendors";
import { CustomFormSelectField } from "@/components/custom-form-field";

export default function BasicInfoForm({
  form,
  loading,
  generateSlug,
  setFeatureInput,
  featureInput,
  isLoadingCategories,
  categories,
  isLoadingBrands,
  brands,
  isLoadingVendors,
  vendors,
  setImageUrlInput,
  imageUrlInput,
  imageUploadLoading,
  handleImageUpload,
  handleAddImageUrl,
  handleRemoveTag,
  tagInput,
  setTagInput,
  handleAddTag,
  subcategories,
  isLoadingSubcategories,
}: {
  form: UseFormReturn<FormValues>;
  loading: boolean;
  generateSlug: () => void;
  isLoadingCategories: boolean;
  categories: Category[];
  isLoadingBrands: boolean;
  brands: Awaited<ReturnType<typeof getBrands>>["data"];
  isLoadingVendors: boolean;
  vendors: Awaited<ReturnType<typeof getVendors>>["data"];
  setFeatureInput: (value: string) => void;
  featureInput: string;
  setImageUrlInput: (value: string) => void;
  imageUrlInput: string;
  imageUploadLoading: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddImageUrl: () => void;
  handleRemoveTag: (tag: string) => void;
  tagInput: string;
  setTagInput: (value: string) => void;
  handleAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  subcategories: SubcategoryArray;
  isLoadingSubcategories: boolean;
}) {
  return (
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Features</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {field.value && field.value.length > 0 ? (
                        field.value.map((feature, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-2.5 py-1"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => {
                                const newFeatures = [...field.value];
                                newFeatures.splice(index, 1);
                                form.setValue("features", newFeatures);
                              }}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No features added yet
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a feature"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && featureInput.trim()) {
                            e.preventDefault();
                            const newFeatures = [
                              ...field.value,
                              featureInput.trim(),
                            ];
                            form.setValue("features", newFeatures);
                            setFeatureInput("");
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (featureInput.trim()) {
                            const newFeatures = [
                              ...field.value,
                              featureInput.trim(),
                            ];
                            form.setValue("features", newFeatures);
                            setFeatureInput("");
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Add product features that will be displayed on the product
                  page
                </FormDescription>
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
                    placeholder="Brief product description for product cards"
                    {...field}
                  />
                </FormControl>
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
                  <Input disabled={loading} placeholder="SKU123" {...field} />
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
                <FormDescription>UPC, EAN, or other barcode</FormDescription>
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
                <FormDescription>Special sale price (optional)</FormDescription>
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
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
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
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
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
          <CustomFormSelectField
            form={form}
            name="status"
            disabled={loading}
            label="Status"
            placeholder="Select product status"
            onValueChange={(field, val) => {
              field.onChange(val);
            }}
            popoverClassName="max-h-[300px] min-w-[300px]"
            triggerClassName="max-w-[300px] min-w-[300px]"
            options={[
              { id: "draft", name: "Draft" },
              { id: "active", name: "Active" },
              { id: "archived", name: "Archived" },
            ]}
            description="Control whether this product is visible to customers"
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
                    Featured products are displayed prominently on your store
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <CustomFormSelectField
            form={form}
            name="categoryId"
            disabled={loading || isLoadingCategories}
            label="Category"
            placeholder="Select a category"
            onValueChange={(field, val) => {
              field.onChange(val);
              form.setValue("subcategoryId", "");
            }}
            options={categories?.map((category) => ({
              id: category.id,
              name: category.name,
            }))}
            popoverClassName="max-h-[300px] min-w-[300px]"
            triggerClassName="max-w-[300px] min-w-[300px]"
          />

          <CustomFormSelectField
            form={form}
            name="subcategoryId"
            disabled={
              loading || isLoadingSubcategories || subcategories?.length === 0
            }
            label="Subcategory"
            placeholder="Select a category"
            onValueChange={(field, val) => {
              field.onChange(val);
            }}
            options={(subcategories || [])?.map((subcategory) => ({
              id: subcategory.id,
              name: subcategory.name,
            }))}
            popoverClassName="max-h-[300px] min-w-[300px]"
            triggerClassName="max-w-[300px] min-w-[300px]"
          />

          <CustomFormSelectField
            form={form}
            name="brandId"
            disabled={loading || isLoadingBrands}
            label="Brand"
            placeholder="Select a brand"
            onValueChange={(field, val) => {
              field.onChange(val);
            }}
            options={(brands || [])?.map((brand) => ({
              id: brand.id,
              name: brand.name,
            }))}
            popoverClassName="max-h-[300px] min-w-[300px]"
            triggerClassName="max-w-[300px] min-w-[300px]"
          />

          <CustomFormSelectField
            form={form}
            name="vendorId"
            disabled={loading || isLoadingVendors}
            label="Vendor"
            placeholder="Select a vendor"
            onValueChange={(field, val) => {
              field.onChange(val);
            }}
            options={(vendors || [])?.map((vendor) => ({
              id: vendor.id,
              name: vendor.name,
            }))}
            popoverClassName="max-h-[300px] min-w-[300px]"
            triggerClassName="max-w-[300px] min-w-[300px]"
          />
        </div>

        <ImagesUploader
          form={form}
          handleImageUpload={handleImageUpload}
          imageUploadLoading={imageUploadLoading}
          imageUrlInput={imageUrlInput}
          handleAddImageUrl={handleAddImageUrl}
          setImageUrlInput={setImageUrlInput}
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
                  {(field.value || []).map((tag: string, index: number) => (
                    <Badge key={`${tag}-${index}`} className="px-3 py-1">
                      <span>{tag}</span>
                      <X
                        className="h-3 w-3 ml-2 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
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
  );
}
