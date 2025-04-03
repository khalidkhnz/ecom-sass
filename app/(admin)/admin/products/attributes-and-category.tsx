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
import { getBrands } from "@/app/actions/brands";
import { getVendors } from "@/app/actions/vendors";
import { CustomFormSelectField } from "@/components/custom-form-field";
import { useState, useEffect } from "react";

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
  brands: Awaited<ReturnType<typeof getBrands>>["data"];
  isLoadingVendors: boolean;
  vendors: Awaited<ReturnType<typeof getVendors>>["data"];
  attributeName: string;
  setAttributeName: (value: string) => void;
  attributeValue: string;
  setAttributeValue: (value: string) => void;
  subcategories: SubcategoryArray;
  isLoadingSubcategories: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const categoryOptions =
    categories?.map((category) => ({
      id: category.id,
      name: category.name,
    })) || [];

  const filteredCategories =
    searchTerm.trim() === ""
      ? categoryOptions
      : categoryOptions.filter((c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-4">
          <Heading title="Categories & Associations" size="sm" />
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
            options={filteredCategories}
            searchMode={true}
            searchPlaceholder="Search for a category"
            searchTerm={searchTerm}
            onSearchTermChange={handleSearchChange}
            popoverClassName="max-h-[500px] min-w-[500px]"
            triggerClassName="max-w-[500px] min-w-[500px]"
          />

          <CustomFormSelectField
            form={form}
            name="subcategoryId"
            disabled={
              loading || isLoadingSubcategories || subcategories?.length === 0
            }
            label="Subcategory"
            placeholder="Select a subcategory"
            onValueChange={(field, val) => {
              field.onChange(val);
            }}
            options={(subcategories || [])?.map((subcategory) => ({
              id: subcategory.id,
              name: subcategory.name,
            }))}
            popoverClassName="max-h-[500px] min-w-[500px]"
            triggerClassName="max-w-[500px] min-w-[500px]"
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
            popoverClassName="max-h-[500px] min-w-[500px]"
            triggerClassName="max-w-[500px] min-w-[500px]"
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
            popoverClassName="max-h-[500px] min-w-[500px]"
            triggerClassName="max-w-[500px] min-w-[500px]"
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
