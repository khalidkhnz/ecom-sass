"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Subcategory } from "@/schema/subcategories";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { deleteSubcategory } from "@/app/actions/subcategories";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const columns: ColumnDef<Subcategory>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "category.name",
    header: "Category",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter();
      const subcategory = row.original;

      const onDelete = async () => {
        try {
          if (confirm("Are you sure you want to delete this subcategory?")) {
            const result = await deleteSubcategory(subcategory.id);
            if (result.error) {
              toast.error(result.error);
            } else {
              toast.success(result.success);
              router.refresh();
            }
          }
        } catch (error) {
          toast.error("Something went wrong");
        }
      };

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
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/subcategories/${subcategory.id}`}
                className="flex items-center"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={onDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
