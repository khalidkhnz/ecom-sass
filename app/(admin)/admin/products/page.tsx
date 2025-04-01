import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductsClient } from "./products-client";
import { Heading } from "@/components/ui/heading";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading title="Products" description="Manage your store products" />
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Link>
        </Button>
      </div>
      <Separator />
      <ProductsClient />
    </div>
  );
}
