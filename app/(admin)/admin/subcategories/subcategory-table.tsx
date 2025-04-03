"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/ui/data-table";
import { useSubcategories } from "@/hooks/useSubcategories";
import { formatDate } from "@/lib/utils";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryName: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export function SubcategoryTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { subcategories, pagination, isLoading, deleteSubcategory } =
    useSubcategories({
      search,
      page,
      limit,
    });

  const handleEdit = (id: string) => {
    router.push(`/admin/subcategories/${id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteSubcategory(id);
  };

  const columns: Column<Subcategory>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Slug",
      accessorKey: "slug",
    },
    {
      header: "Category",
      accessorKey: "categoryName",
    },
    {
      header: "Description",
      accessorKey: "description",
      className: "max-w-xs truncate",
    },
    {
      header: "Products",
      accessorKey: "productCount",
      className: "text-center",
    },
    {
      header: "Created",
      accessorKey: (item) => formatDate(item.createdAt.toISOString()),
    },
  ];

  return (
    <DataTable
      data={subcategories}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Search subcategories..."
      onSearch={setSearch}
      onEdit={handleEdit}
      onDelete={handleDelete}
      pagination={pagination}
      onPageChange={setPage}
      idField="id"
      nameField="name"
      countField="productCount"
      emptyMessage="No subcategories found"
    />
  );
}
