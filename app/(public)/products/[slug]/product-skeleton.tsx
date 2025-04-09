import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ProductSkeleton() {
  return (
    <div className="py-10">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image Gallery Skeleton */}
          <div>
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex space-x-2 mt-4">
              {[1, 2, 3, 4].map((_, i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-md" />
              ))}
            </div>
          </div>

          {/* Product Details Skeleton */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-9 w-full max-w-md mb-2" />
              <Skeleton className="h-8 w-24 mt-2" />
            </div>

            <Skeleton className="h-6 w-32" />

            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>

            <Skeleton className="h-24 w-full" />

            <div className="pt-4">
              <div className="flex items-center mb-6">
                <Skeleton className="h-6 w-20 mr-3" />
                <div className="flex-1 flex items-center border rounded-md h-10">
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>

              <div className="flex space-x-4">
                <Skeleton className="h-11 flex-1" />
                <Skeleton className="h-11 w-11" />
              </div>
            </div>

            <Skeleton className="h-32 w-full rounded-lg mt-6" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mt-16">
          <div className="flex space-x-4 border-b mb-4">
            {[1, 2, 3].map((_, i) => (
              <Skeleton key={i} className="h-10 w-28" />
            ))}
          </div>
          <div className="pt-4">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-24 w-full mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <Skeleton className="h-6 w-24 mb-4" />
                {[1, 2, 3, 4].map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full max-w-xs mb-2" />
                ))}
              </div>
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex justify-between mb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Skeleton */}
        <div className="mt-16">
          <Separator className="mb-8" />
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-full max-w-[200px]" />
                <Skeleton className="h-4 w-24" />
                <div className="flex space-x-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
