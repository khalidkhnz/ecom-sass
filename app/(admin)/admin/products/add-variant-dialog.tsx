"use client";

import { UseFormReturn } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormValues } from "./product-form";

export default function AddVariantDialog({
  isVariantDialogOpen,
  setIsVariantDialogOpen,
  editingVariant,
  setEditingVariant,
  form,
}: {
  isVariantDialogOpen: boolean;
  setIsVariantDialogOpen: (open: boolean) => void;
  editingVariant: any;
  setEditingVariant: (variant: any) => void;
  form: UseFormReturn<FormValues>;
}) {
  return (
    <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingVariant?.id ? "Edit Variant" : "Add Variant"}
          </DialogTitle>
          <DialogDescription>
            {editingVariant?.id
              ? "Update the details for this product variant."
              : "Add a new variant to this product."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variant-name" className="text-right">
              Name
            </Label>
            <Input
              id="variant-name"
              value={editingVariant?.name || ""}
              onChange={(e) =>
                setEditingVariant({ ...editingVariant, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variant-sku" className="text-right">
              SKU
            </Label>
            <Input
              id="variant-sku"
              value={editingVariant?.sku || ""}
              onChange={(e) =>
                setEditingVariant({ ...editingVariant, sku: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variant-price" className="text-right">
              Price (Tax Included)
            </Label>
            <Input
              id="variant-price"
              type="number"
              step="0.01"
              value={editingVariant?.price || ""}
              onChange={(e) =>
                setEditingVariant({
                  ...editingVariant,
                  price: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              className="col-span-3"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-24">
            Enter the final price including tax that customers will pay
          </p>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variant-inventory" className="text-right">
              Inventory
            </Label>
            <Input
              id="variant-inventory"
              type="number"
              value={editingVariant?.inventory || 0}
              onChange={(e) =>
                setEditingVariant({
                  ...editingVariant,
                  inventory: parseInt(e.target.value) || 0,
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variant-barcode" className="text-right">
              Barcode
            </Label>
            <Input
              id="variant-barcode"
              value={editingVariant?.barcode || ""}
              onChange={(e) =>
                setEditingVariant({
                  ...editingVariant,
                  barcode: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right"></div>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="variant-default"
                checked={editingVariant?.default || false}
                onCheckedChange={(checked) =>
                  setEditingVariant({ ...editingVariant, default: !!checked })
                }
              />
              <Label htmlFor="variant-default">Set as default variant</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsVariantDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (editingVariant) {
                const currentVariants = form.getValues("variants");
                if (!currentVariants) return;

                const variants = [...currentVariants];

                // Update or add the variant
                if (editingVariant.index !== undefined) {
                  variants[editingVariant.index] = {
                    ...editingVariant,
                    // Remove the index property as it's not part of the variant data
                    index: undefined,
                  };
                } else {
                  variants.push({
                    ...editingVariant,
                    index: undefined,
                  });
                }

                // If this variant is set as default, unset others
                if (editingVariant.default) {
                  variants.forEach((v, i) => {
                    if (i !== editingVariant.index) {
                      variants[i] = { ...variants[i], default: false };
                    }
                  });
                }

                form.setValue("variants", variants);
              }

              setIsVariantDialogOpen(false);
              setEditingVariant(null);
            }}
          >
            Save Variant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
