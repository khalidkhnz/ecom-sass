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
import { CategoryTable } from "./category-table";
import Link from "next/link";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-gray-500">Manage your product categories</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>New Category</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            View and manage all product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryTable />
        </CardContent>
      </Card>
    </div>
  );
}
