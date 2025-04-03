import { getCategories } from "@/app/actions/categories";
import { SubcategoryForm } from "../subcategory-form";

export default async function NewSubcategoryPage() {
  const { data: categories, error } = await getCategories();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">New Subcategory</h2>
      </div>
      <div className="grid gap-4">
        <SubcategoryForm categories={categories || []} />
      </div>
    </div>
  );
}
