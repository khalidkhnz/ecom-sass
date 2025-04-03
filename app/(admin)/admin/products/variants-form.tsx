"use client";

import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./product-form";
import { Heading } from "@/components/ui/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Pencil, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function VariantsForm({
  form,
  setEditingVariant,
  setIsVariantDialogOpen,
}: {
  form: UseFormReturn<FormValues>;
  setEditingVariant: (variant: any) => void;
  setIsVariantDialogOpen: (open: boolean) => void;
}) {
  return (
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
                        <TableHead>Delete</TableHead>
                        <TableHead>Edit</TableHead>
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
                              <TableCell>{variant.price || "-"}</TableCell>
                              <TableCell>{variant.inventory || "0"}</TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={variant.default || false}
                                  onCheckedChange={(checked) => {
                                    const currentVariants =
                                      form.getValues("variants");
                                    if (!currentVariants) return;

                                    const variants = [...currentVariants];

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

                                    form.setValue("variants", variants);
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

                                    const variants = [...currentVariants];
                                    variants.splice(index, 1);
                                    form.setValue("variants", variants);
                                  }}
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingVariant({
                                      ...variant,
                                      index,
                                    });
                                    setIsVariantDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
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
              const variants = currentVariants ? [...currentVariants] : [];

              const newVariant = {
                name: "",
                sku: "",
                price: undefined,
                inventory: 0,
                default: variants.length === 0, // First variant is default
                images: [],
              };

              variants.push(newVariant);
              form.setValue("variants", variants);

              // Open dialog to edit the new variant
              setEditingVariant({
                ...newVariant,
                index: variants.length - 1,
              });
              setIsVariantDialogOpen(true);
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
            Select a variant from the list to edit its details, or click "Add
            Variant" to create a new one.
          </p>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Each variant must have a unique SKU. If a variant has a price, it
              will override the main product price for that variant.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
