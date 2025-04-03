import { Separator } from "@/components/ui/separator";
import { ProductForm } from "../product-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface ProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Make changes to your product</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to products
          </Link>
        </Button>
      </div>
      <Separator />
      <ProductForm productId={(await params).productId} />
    </div>
  );
}
