import { getSubcategories } from "@/app/actions/subcategories";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";

export default async function SubcategoriesPage() {
  const { data: subcategories, error } = await getSubcategories();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Subcategories</h2>
        <Link href="/admin/subcategories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subcategory
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={subcategories || []} />
    </div>
  );
}
