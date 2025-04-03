"use client";

import { FormValues } from "./product-form";
import { UseFormReturn } from "react-hook-form";
import ImagesUploader from "./images-uploader";
import { Heading } from "@/components/ui/heading";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

export default function MediaAndSeoForm({
  form,
  loading,
  handleRemoveTag,
  tagInput,
  setTagInput,
  handleAddTag,
  handleImageUpload,
  imageUploadLoading,
  imageUrlInput,
  handleAddImageUrl,
  setImageUrlInput,
}: {
  form: UseFormReturn<FormValues>;
  loading: boolean;
  handleRemoveTag: (tag: string) => void;
  tagInput: string;
  setTagInput: (tag: string) => void;
  handleAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageUploadLoading: boolean;
  imageUrlInput: string;
  handleAddImageUrl: () => void;
  setImageUrlInput: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-4">
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
                    {["new", "bestseller", "featured", "sale", "limited"].map(
                      (label) => (
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
                                const currentLabels = Array.isArray(field.value)
                                  ? [...field.value]
                                  : [];

                                if (checked) {
                                  if (!currentLabels.includes(label)) {
                                    field.onChange([...currentLabels, label]);
                                  }
                                } else {
                                  field.onChange(
                                    currentLabels.filter((l) => l !== label)
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
                      )
                    )}
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
    </div>
  );
}
