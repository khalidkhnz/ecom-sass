import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryForm } from "../category-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">New Category</h1>
          <p className="text-gray-500">Create a new product category</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/categories">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to categories
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>
            Enter information about the new category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
