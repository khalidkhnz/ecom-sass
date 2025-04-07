"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import VariantSelector from "./variant-selector";
import QuantitySelector from "./quantity-selector";
import AddToCartButton from "./add-to-cart-button";
import WishlistButton from "./wishlist-button";

interface Variant {
  id: string;
  name: string;
  price: string | null;
  sku: string;
  default: boolean;
  options?: Record<string, string>;
}

interface Product {
  id: string;
  name: string;
  price: string;
  discountPrice: string | null;
  sku: string;
  inventory: number;
}

interface ProductVariantsSectionProps {
  product: Product;
  variants: Variant[];
  inStock: boolean;
  hasDiscount: boolean;
  discountActive: boolean;
  discountEnd?: Date | null;
}

export default function ProductVariantsSection({
  product,
  variants,
  inStock,
  hasDiscount,
  discountActive,
  discountEnd,
}: ProductVariantsSectionProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants.find((v) => v.default) || variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);

  // Handle variant selection
  const handleVariantChange = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId) || null;
    setSelectedVariant(variant);
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  // Determine current variant price if applicable
  const currentVariantPrice = selectedVariant?.price
    ? formatPrice(selectedVariant.price)
    : null;

  // Get the display SKU (variant SKU or product SKU)
  const displaySku = selectedVariant?.sku || product.sku;

  const hasVariants = variants && variants.length > 0;

  return (
    <div className="space-y-6">
      {/* SKU and selected variant */}
      <div className="text-sm text-muted-foreground mt-1">
        SKU: {displaySku}
        {selectedVariant && (
          <span className="ml-2">Variant: {selectedVariant.name}</span>
        )}
      </div>

      {/* Price section */}
      <div className="flex items-baseline mt-4">
        {selectedVariant?.price ? (
          <p className="text-2xl font-semibold">{currentVariantPrice}</p>
        ) : (
          <>
            <p
              className={
                hasDiscount && discountActive
                  ? "text-2xl font-semibold text-muted-foreground line-through mr-2"
                  : "text-2xl font-semibold"
              }
            >
              {formatPrice(product.price)}
            </p>

            {hasDiscount && discountActive && (
              <p className="text-2xl font-bold text-red-600">
                {formatPrice(product.discountPrice || "0")}
              </p>
            )}

            {hasDiscount && discountActive && (
              <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded">
                Save{" "}
                {Math.round(
                  (1 -
                    parseFloat(product.discountPrice || "0") /
                      parseFloat(product.price)) *
                    100
                )}
                %
              </span>
            )}
          </>
        )}
      </div>

      {/* Discount period if available */}
      {hasDiscount &&
        discountActive &&
        discountEnd &&
        !selectedVariant?.price && (
          <p className="text-sm text-red-600 mt-1">
            Sale ends{" "}
            {new Date(discountEnd).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

      {/* Variants selection if available */}
      {hasVariants && (
        <div className="space-y-3">
          <h3 className="font-medium">Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <VariantSelector
              variants={variants}
              onSelectVariant={handleVariantChange}
              selectedVariantId={selectedVariant?.id}
            />
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="pt-4">
        <div className="flex items-center mb-6">
          <span className="text-sm font-medium mr-3">Quantity:</span>
          <QuantitySelector
            productId={product.id}
            inStock={inStock}
            onChange={handleQuantityChange}
            initialQuantity={quantity}
          />
        </div>

        {/* Add to Cart Button and Wishlist Button */}
        <div className="flex space-x-4">
          <AddToCartButton
            product={product}
            inStock={inStock}
            variantId={selectedVariant?.id}
            quantity={quantity}
          />
          <WishlistButton
            productId={product.id}
            variantId={selectedVariant?.id}
          />
        </div>
      </div>
    </div>
  );
}
