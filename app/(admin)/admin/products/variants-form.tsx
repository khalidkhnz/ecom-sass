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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import AddVariantDialog from "./add-variant-dialog";

export default function VariantsForm({
  form,
  loading,
}: {
  form: UseFormReturn<FormValues>;
  loading: boolean;
}) {
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);

  const variants = form.watch("variants") || [];

  const handleDeleteVariant = (index: number) => {
    const currentVariants = form.getValues("variants");
    if (!currentVariants) return;

    const newVariants = [...currentVariants];
    newVariants.splice(index, 1);
    form.setValue("variants", newVariants);
  };

  const handleEdit = (index: number) => {
    const variant = variants[index];
    setEditingVariant({ ...variant, index });
    setIsVariantDialogOpen(true);
  };

  const handleAddVariant = () => {
    setEditingVariant({
      name: "",
      sku: "",
      price: "",
      inventory: 0,
      images: [],
      default: variants.length === 0, // First variant is default
    });
    setIsVariantDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading title="Product Variants" size="sm" />
        <Button
          onClick={handleAddVariant}
          type="button"
          size="sm"
          disabled={loading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No variants added</AlertTitle>
          <AlertDescription>
            Add variants if this product comes in different sizes, colors, or
            other options.
          </AlertDescription>
        </Alert>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price (Tax Included)</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, index) => (
              <TableRow key={variant.id || index}>
                <TableCell>{variant.name}</TableCell>
                <TableCell>{variant.sku}</TableCell>
                <TableCell>{variant.price || "-"}</TableCell>
                <TableCell>{variant.inventory || "0"}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={variant.default}
                    onCheckedChange={(checked) => {
                      const currentVariants = form.getValues("variants");
                      if (!currentVariants) return;

                      // If setting this one as default, uncheck all others
                      if (checked) {
                        const newVariants = currentVariants.map((v, i) => ({
                          ...v,
                          default: i === index,
                        }));
                        form.setValue("variants", newVariants);
                      } else {
                        // Just update this one
                        const newVariants = [...currentVariants];
                        newVariants[index].default = !!checked;
                        form.setValue("variants", newVariants);
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(index)}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteVariant(index)}
                      type="button"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AddVariantDialog
        isVariantDialogOpen={isVariantDialogOpen}
        setIsVariantDialogOpen={setIsVariantDialogOpen}
        editingVariant={editingVariant}
        setEditingVariant={setEditingVariant}
        form={form}
      />
    </div>
  );
}
