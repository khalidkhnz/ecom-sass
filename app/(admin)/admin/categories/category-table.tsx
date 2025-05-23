"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { DataTable, Column } from "@/components/ui/data-table";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export function CategoryTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { categories, pagination, isLoading, deleteCategory } = useCategories({
    search,
    page,
    limit,
  });

  const handleEdit = (id: string) => {
    router.push(`/admin/categories/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns: Column<Category>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Slug",
      accessorKey: "slug",
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
      data={categories}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Search categories..."
      onSearch={setSearch}
      onEdit={handleEdit}
      onDelete={handleDelete}
      pagination={pagination}
      onPageChange={setPage}
      idField="id"
      nameField="name"
      countField="productCount"
      emptyMessage="No categories found"
    />
  );
}
