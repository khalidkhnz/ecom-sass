"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useVendors } from "@/hooks/useVendors";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Vendor as BaseVendor } from "@/schema/products";

interface Vendor extends BaseVendor {
  productCount: number;
}

export function VendorTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { vendors, pagination, isLoading, deleteVendor } = useVendors({
    search,
    page,
    limit,
  });

  const handleEdit = (id: string) => {
    router.push(`/admin/vendors/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVendor(id);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const columns: Column<Vendor>[] = [
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
            className="w-10 h-10 object-cover rounded"
          />
        ) : null,
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Phone",
      accessorKey: "phone",
    },
    {
      header: "Status",
      accessorKey: (item) => (
        <Badge
          variant={
            item.status === "active"
              ? "default"
              : item.status === "pending"
              ? "secondary"
              : "destructive"
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Commission Rate",
      accessorKey: (item) =>
        `${parseFloat(item.commissionRate || "0").toFixed(2)}%`,
    },
    {
      header: "Products",
      accessorKey: (item) => item.productCount,
      className: "text-center",
    },
    {
      header: "Created",
      accessorKey: (item) => formatDate(item.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={vendors as Vendor[]}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search vendors..."
        onSearch={setSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={pagination}
        onPageChange={setPage}
        idField="id"
        nameField="name"
        countField="productCount"
        emptyMessage="No vendors found"
      />
    </div>
  );
}
