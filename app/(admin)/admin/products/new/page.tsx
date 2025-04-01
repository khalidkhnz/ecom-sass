import { Separator } from "@/components/ui/separator";
import { ProductForm } from "../product-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Heading } from "@/components/ui/heading";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title="New Product"
          description="Create a new product for your store"
        />
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to products
          </Link>
        </Button>
      </div>
      <Separator />
      <ProductForm />
    </div>
  );
}
