import { Suspense } from "react";
import { BrandsClient } from "./brands-client";
import { getBrands } from "@/app/actions/brands";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Brands | Admin Dashboard",
  description: "Manage your store brands",
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="flex-col">
      <div className="flex items-center justify-between">
        <Heading
          title={`Brands (${brands.length})`}
          description="Manage your store brands"
        />
        <Button asChild>
          <Link href="/admin/brands/new">
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </Button>
      </div>
      <Separator className="my-4" />
      <Suspense fallback={<div>Loading brands...</div>}>
        <BrandsClient data={brands} />
      </Suspense>
    </div>
  );
}
