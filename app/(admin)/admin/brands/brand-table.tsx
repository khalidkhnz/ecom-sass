"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/ui/data-table";
import { useBrands } from "@/hooks/useBrands";
import { formatDate } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export function BrandTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { brands, pagination, isLoading, deleteBrand } = useBrands({
    search,
    page,
    limit,
  });

  const handleEdit = (id: string) => {
    router.push(`/admin/brands/${id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteBrand(id);
  };

  const columns: Column<Brand>[] = [
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
      header: "Logo",
      accessorKey: (item) =>
        item.logo ? (
          <img
            src={item.logo}
            alt={item.name}
            className="w-8 h-8 object-contain"
          />
        ) : (
          "-"
        ),
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
      data={brands}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Search brands..."
      onSearch={setSearch}
      onEdit={handleEdit}
      onDelete={handleDelete}
      pagination={pagination}
      onPageChange={setPage}
      idField="id"
      nameField="name"
      countField="productCount"
      emptyMessage="No brands found"
    />
  );
}
