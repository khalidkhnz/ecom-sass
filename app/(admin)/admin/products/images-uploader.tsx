"use client";

import { FormField, FormLabel, FormItem } from "@/components/ui/form";

import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./product-form";
import { Heading } from "@/components/ui/heading";
import { ImageIcon, Upload, Link, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormDescription, FormMessage } from "@/components/ui/form";

export default function ImagesUploader({
  form,
  handleImageUpload,
  imageUploadLoading,
  imageUrlInput,
  handleAddImageUrl,
  setImageUrlInput,
}: {
  form: UseFormReturn<FormValues>;

  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageUploadLoading: boolean;
  imageUrlInput: string;
  handleAddImageUrl: () => void;
  setImageUrlInput: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Heading title="Images & Media" size="sm" />
      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Images</FormLabel>

            {/* Image Upload Area */}
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center space-y-4">
              <div className="flex flex-col items-center justify-center text-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Upload product images</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag and drop images here, or click to select files
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <label htmlFor="image-upload" className="flex-1">
                  <div className="flex items-center justify-center gap-2 h-10 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Select Files</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={imageUploadLoading}
                    />
                  </div>
                </label>

                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Or paste image URL"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    disabled={imageUploadLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddImageUrl}
                    disabled={!imageUrlInput.trim() || imageUploadLoading}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <FormDescription>
              Upload product images or add image URLs. You can add multiple
              images.
            </FormDescription>
            <FormMessage />

            {/* Display preview of images */}
            {field.value && field.value.length > 0 && (
              <div className="mt-4">
                <FormLabel>Image Preview</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {field.value.map((url: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-square border rounded-md overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt={`Product image ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://via.placeholder.com/300x300?text=Invalid+Image";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const newImages = [...field.value];
                            newImages.splice(index, 1);
                            field.onChange(newImages);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
}
