"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistItemSkeleton() {
  // Create an array of 4 items for the skeleton
  const skeletonItems = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {skeletonItems.map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="relative pb-[100%]">
            <Skeleton className="absolute inset-0 rounded-none" />
          </div>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-9 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
