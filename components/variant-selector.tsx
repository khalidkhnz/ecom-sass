"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

interface Variant {
  id: string;
  name: string;
  price: string | null;
  sku: string;
  default: boolean;
  options?: Record<string, string>;
}

interface VariantSelectorProps {
  variants: Variant[];
  onSelectVariant: (variantId: string) => void;
  selectedVariantId?: string | null;
}

export default function VariantSelector({
  variants,
  onSelectVariant,
  selectedVariantId: initialSelectedId = null,
}: VariantSelectorProps) {
  // Find the default variant or use the first one
  const defaultVariant = variants.find((v) => v.default) || variants[0] || null;

  // State for the selected variant ID
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    initialSelectedId || defaultVariant?.id || null
  );

  // Update state if prop changes
  useEffect(() => {
    if (
      initialSelectedId !== undefined &&
      initialSelectedId !== selectedVariantId
    ) {
      setSelectedVariantId(initialSelectedId);
    }
  }, [initialSelectedId, selectedVariantId]);

  // Handle variant selection
  const handleVariantClick = (variantId: string) => {
    setSelectedVariantId(variantId);
    onSelectVariant(variantId);
  };

  return (
    <>
      {variants.map((variant) => {
        const isSelected = selectedVariantId === variant.id;

        return (
          <div
            key={variant.id}
            className={cn(
              "border rounded-md p-3 cursor-pointer hover:border-primary transition-colors",
              isSelected ? "border-primary ring-1 ring-primary" : ""
            )}
            onClick={() => handleVariantClick(variant.id)}
            data-variant-id={variant.id}
            role="button"
            aria-pressed={isSelected}
            tabIndex={0}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{variant.name}</h4>
                {variant.price && (
                  <p className="text-sm mt-1 font-medium">
                    {formatPrice(variant.price)}
                  </p>
                )}
                {variant.options &&
                  Object.entries(variant.options).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(variant.options).map(([key, value]) => (
                        <div
                          key={key}
                          className="text-xs text-muted-foreground"
                        >
                          {key}: <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              {isSelected && (
                <Badge variant="outline" className="ml-2">
                  Selected
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
