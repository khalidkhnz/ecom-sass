import { getCategories } from "@/app/actions/categories";
import { getSubcategoryById } from "@/app/actions/subcategories";
import { SubcategoryForm } from "../subcategory-form";
import { notFound } from "next/navigation";

interface EditSubcategoryPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditSubcategoryPage({
  params,
}: EditSubcategoryPageProps) {
  const { id } = await params;
  const { data: subcategory, error: subcategoryError } =
    await getSubcategoryById(id);
  const { data: categories, error: categoriesError } = await getCategories();

  if (subcategoryError || categoriesError || !subcategory) {
    return notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Subcategory</h2>
      </div>
      <div className="grid gap-4">
        <SubcategoryForm
          initialData={{
            id: subcategory.id,
            name: subcategory.name,
            slug: subcategory.slug,
            description: subcategory.description || "",
            categoryId: subcategory.categoryId,
          }}
          categories={categories || []}
        />
      </div>
    </div>
  );
}
