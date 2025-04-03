"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Edit,
  MoreHorizontal,
  Star,
  Trash,
  ArrowUpDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brand } from "@/schema/products";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { AlertModal } from "@/components/modals/alert-modal";
import { deleteBrand, toggleBrandFeatured } from "@/app/actions/brands";
import { ColumnDef } from "@tanstack/react-table";

interface BrandsClientProps {
  data: Brand[];
}

export const BrandsClient = ({ data }: BrandsClientProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Brand ID copied to clipboard");
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      setLoading(true);
      await toggleBrandFeatured(id, featured);
      toast.success(
        `Brand ${featured ? "unfeatured" : "featured"} successfully`
      );
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;

    try {
      setLoading(true);
      await deleteBrand(brandToDelete.id);
      toast.success("Brand deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
      setBrandToDelete(null);
    }
  };

  const columns: ColumnDef<Brand>[] = [
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
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.original.slug}</div>
      ),
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) => (
        <div>
          {row.original.featured ? (
            <Badge className="bg-yellow-500 hover:bg-yellow-600">
              Featured
            </Badge>
          ) : (
            <Badge variant="outline">No</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "website",
      header: "Website",
      cell: ({ row }) => (
        <div className="truncate max-w-[200px]">
          {row.original.website ? (
            <a
              href={row.original.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              {row.original.website}
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">No website</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const brand = row.original;
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
              <DropdownMenuItem onClick={() => handleCopy(brand.id)}>
                <Copy className="mr-2 h-4 w-4" /> Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/brands/${brand.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleToggleFeatured(brand.id, brand.featured || false)
                }
              >
                <Star className="mr-2 h-4 w-4" />
                {brand.featured ? "Unfeature" : "Feature"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setBrandToDelete(brand);
                  setOpen(true);
                }}
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setBrandToDelete(null);
        }}
        onConfirm={handleDelete}
        loading={loading}
      />
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search brands..."
      />
    </>
  );
};
