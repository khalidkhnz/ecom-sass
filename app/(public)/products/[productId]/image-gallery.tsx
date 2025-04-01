"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);

  const handlePrevious = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImage(index);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border aspect-square bg-background">
        {/* Main image */}
        <img
          src={images[currentImage]}
          alt="Product image"
          className="h-full w-full object-contain"
        />

        {/* Navigation arrows - only show if more than one image */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-70 hover:opacity-100 bg-background"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous image</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-70 hover:opacity-100 bg-background"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next image</span>
            </Button>

            {/* Image counter */}
            <div className="absolute bottom-2 right-2 bg-background/80 text-foreground px-2 py-1 text-xs rounded-md">
              {currentImage + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border",
                currentImage === index
                  ? "ring-2 ring-primary"
                  : "hover:ring-1 hover:ring-primary/50"
              )}
              onClick={() => handleThumbnailClick(index)}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
