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

// Mock category data for UI
const categories = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and accessories",
    productCount: 24,
    createdAt: "2023-03-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Clothing",
    slug: "clothing",
    description: "Fashion items and apparel",
    productCount: 36,
    createdAt: "2023-03-12T11:30:00Z",
  },
  {
    id: "3",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Furniture, appliances, and kitchenware",
    productCount: 42,
    createdAt: "2023-03-10T09:45:00Z",
  },
  {
    id: "4",
    name: "Books",
    slug: "books",
    description: "Books, magazines, and educational resources",
    productCount: 18,
    createdAt: "2023-03-08T14:20:00Z",
  },
  {
    id: "5",
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description: "Sporting goods and outdoor equipment",
    productCount: 15,
    createdAt: "2023-03-05T16:15:00Z",
  },
];

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
          <CategoryTable categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
