import { Separator } from "@/components/ui/separator";
import { CategoryForm } from "../../category-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { categoryId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">
            Update an existing product category
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/categories">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to categories
          </Link>
        </Button>
      </div>
      <Separator />
      <div className="max-w-2xl">
        <CategoryForm categoryId={categoryId} />
      </div>
    </div>
  );
}
