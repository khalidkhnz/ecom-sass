import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import WishlistItemSkeleton from "./wishlist-item-skeleton";
import WishlistItems from "./wishlist-items";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function WishlistPage() {
  return (
    <Container>
      <div className="py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Heart className="mr-2 h-6 w-6" />
            My Wishlist
          </h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <Suspense fallback={<WishlistItemSkeleton />}>
          <WishlistItems />
        </Suspense>
      </div>
    </Container>
  );
}
