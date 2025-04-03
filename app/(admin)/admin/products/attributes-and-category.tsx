"use client";
import { UseFormReturn } from "react-hook-form";
import { FormValues, SubcategoryArray } from "./product-form";
import { Heading } from "@/components/ui/heading";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Category } from "@/schema/categories";
import { Brand, Vendor } from "@/schema/products";

export default function AttributesAndCategories({
  form,
  loading,
  isLoadingCategories,
  categories,
  isLoadingBrands,
  brands,
  isLoadingVendors,
  vendors,
  attributeName,
  setAttributeName,
  attributeValue,
  setAttributeValue,
  subcategories,
  isLoadingSubcategories,
}: {
  form: UseFormReturn<FormValues>;
  loading: boolean;
  isLoadingCategories: boolean;
  categories: Category[];
  isLoadingBrands: boolean;
  brands: Brand[];
  isLoadingVendors: boolean;
  vendors: Vendor[];
  attributeName: string;
  setAttributeName: (value: string) => void;
  attributeValue: string;
  setAttributeValue: (value: string) => void;
  subcategories: SubcategoryArray;
  isLoadingSubcategories: boolean;
}) {
  return (
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
                  onValueChange={(...props) => {
                    field.onChange(...props);
                    form.setValue("subcategoryId", "");
                  }}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-[200px]">
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

          <FormField
            control={form.control}
            name="subcategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory</FormLabel>
                <Select
                  disabled={
                    loading ||
                    isLoadingSubcategories ||
                    subcategories?.length === 0
                  }
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subcategories?.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
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
                    <SelectTrigger className="w-[200px]">
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
                    <SelectTrigger className="w-[200px]">
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
                <div className="space-y-4">
                  {/* Display existing attributes */}
                  {field.value && Object.keys(field.value).length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Current Attributes
                      </div>
                      <div className="grid gap-2">
                        {Object.entries(field.value).map(
                          ([key, value], index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 border rounded-md"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{key}</div>
                                <div className="text-sm text-muted-foreground">
                                  {Array.isArray(value)
                                    ? value.join(", ")
                                    : value}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newAttributes = {
                                    ...field.value,
                                  };
                                  delete newAttributes[key];
                                  field.onChange(newAttributes);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add new attribute */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Add New Attribute</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        placeholder="Attribute name (e.g., Color, Size)"
                        value={attributeName}
                        onChange={(e) => setAttributeName(e.target.value)}
                      />
                      <Input
                        placeholder="Attribute value (e.g., Red, XL)"
                        value={attributeValue}
                        onChange={(e) => setAttributeValue(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          if (attributeName && attributeValue) {
                            const currentAttributes = field.value || {};
                            const newAttributes = {
                              ...currentAttributes,
                            };

                            // Check if the attribute already exists
                            if (newAttributes[attributeName]) {
                              // If it's an array, add to it
                              if (Array.isArray(newAttributes[attributeName])) {
                                if (
                                  !newAttributes[attributeName].includes(
                                    attributeValue
                                  )
                                ) {
                                  newAttributes[attributeName] = [
                                    ...newAttributes[attributeName],
                                    attributeValue,
                                  ];
                                }
                              } else {
                                // Convert to array if it's not already
                                newAttributes[attributeName] = [
                                  newAttributes[attributeName],
                                  attributeValue,
                                ];
                              }
                            } else {
                              // Create new attribute
                              newAttributes[attributeName] = attributeValue;
                            }

                            field.onChange(newAttributes);
                            setAttributeName("");
                            setAttributeValue("");
                          }
                        }}
                      >
                        Add Attribute
                      </Button>
                    </div>
                  </div>
                </div>
                <FormDescription>
                  Add product attributes like color, size, material, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
