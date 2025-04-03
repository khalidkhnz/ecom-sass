"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Check, X, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/schema/products";
import { updateVendorStatus } from "@/app/actions/vendors";

interface VendorsClientProps {
  data: Vendor[];
}

export const VendorsClient: React.FC<VendorsClientProps> = ({ data }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Handle status change
  const onStatusChange = async (
    id: string,
    status: "pending" | "active" | "suspended"
  ) => {
    try {
      setLoading(true);
      await updateVendorStatus(id, status);
      toast.success("Vendor status updated");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="mr-1 h-3 w-3" /> Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <X className="mr-1 h-3 w-3" /> Suspended
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Shield className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  // Table columns definition
  const columns: ColumnDef<Vendor>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.logo && (
              <img
                src={row.original.logo}
                alt={row.original.name}
                className="w-8 h-8 rounded-full inline-block mr-2 object-cover"
              />
            )}
            {row.original.name}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "commissionRate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Commission
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return <div>{row.original.commissionRate}%</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vendor = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/vendors/${vendor.id}`)}
              >
                Edit details
              </DropdownMenuItem>
              {vendor.status !== "active" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(vendor.id, "active")}
                >
                  Activate vendor
                </DropdownMenuItem>
              )}
              {vendor.status !== "suspended" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(vendor.id, "suspended")}
                >
                  Suspend vendor
                </DropdownMenuItem>
              )}
              {vendor.status !== "pending" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(vendor.id, "pending")}
                >
                  Set as pending
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search vendors..."
    />
  );
};
