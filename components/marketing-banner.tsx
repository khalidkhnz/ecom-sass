"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface MarketingBannerProps {
  text?: string;
  highlight?: string;
  link?: string;
}

export function MarketingBanner({
  text = "Free shipping on all orders over",
  highlight = "$50",
  link = "/shipping",
}: MarketingBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-primary py-2 text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-3 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium">
          {text} <strong className="font-semibold">{highlight}</strong>{" "}
          <a href={link} className="inline-block underline">
            Learn more
          </a>
        </p>
        <button
          type="button"
          className="absolute right-4 p-1 rounded-md hover:bg-primary-foreground/10"
          onClick={() => setIsVisible(false)}
        >
          <span className="sr-only">Dismiss</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
