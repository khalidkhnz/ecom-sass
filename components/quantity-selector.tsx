"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  productId: string;
  inStock: boolean;
  initialQuantity?: number;
  onChange?: (quantity: number) => void;
}

export default function QuantitySelector({
  productId,
  inStock,
  initialQuantity = 1,
  onChange,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onChange?.(newQuantity);
    }
  };

  const increaseQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onChange?.(newQuantity);
  };

  return (
    <div className="flex items-center border rounded-md">
      <button
        className="px-3 py-2 hover:bg-accent transition-colors"
        disabled={!inStock || quantity <= 1}
        aria-label="Decrease quantity"
        onClick={decreaseQuantity}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="px-4 py-2 text-center w-12">{quantity}</span>
      <button
        className="px-3 py-2 hover:bg-accent transition-colors"
        disabled={!inStock}
        aria-label="Increase quantity"
        onClick={increaseQuantity}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
