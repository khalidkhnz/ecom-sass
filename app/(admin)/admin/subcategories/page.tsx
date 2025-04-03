import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { SubcategoryTable } from "./subcategory-table";
import Link from "next/link";

export default function SubcategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subcategories</h1>
          <p className="text-gray-500">Manage your product subcategories</p>
        </div>
        <Button asChild>
          <Link href="/admin/subcategories/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>New Subcategory</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subcategories</CardTitle>
          <CardDescription>
            View and manage all product subcategories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubcategoryTable />
        </CardContent>
      </Card>
    </div>
  );
}
