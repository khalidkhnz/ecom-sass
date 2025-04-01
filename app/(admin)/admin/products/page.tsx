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
import { ProductTable } from "./product-table";
import Link from "next/link";

// Mock product data for UI
const products = [
  {
    id: "1",
    name: "Smartphone X",
    price: 799.99,
    category: "Electronics",
    inventory: 45,
    status: "active",
    featured: true,
    createdAt: "2023-03-20T10:30:00Z",
  },
  {
    id: "2",
    name: "Laptop Pro",
    price: 1299.99,
    category: "Electronics",
    inventory: 28,
    status: "active",
    featured: false,
    createdAt: "2023-03-18T09:20:00Z",
  },
  {
    id: "3",
    name: "Wireless Earbuds",
    price: 149.99,
    category: "Electronics",
    inventory: 120,
    status: "active",
    featured: true,
    createdAt: "2023-03-15T14:45:00Z",
  },
  {
    id: "4",
    name: "Designer T-Shirt",
    price: 39.99,
    category: "Clothing",
    inventory: 85,
    status: "active",
    featured: false,
    createdAt: "2023-03-12T11:10:00Z",
  },
  {
    id: "5",
    name: "Running Shoes",
    price: 89.99,
    category: "Sports & Outdoors",
    inventory: 64,
    status: "active",
    featured: true,
    createdAt: "2023-03-10T16:30:00Z",
  },
  {
    id: "6",
    name: "Coffee Maker",
    price: 79.99,
    category: "Home & Kitchen",
    inventory: 32,
    status: "active",
    featured: false,
    createdAt: "2023-03-08T13:15:00Z",
  },
  {
    id: "7",
    name: "Bestselling Novel",
    price: 24.99,
    category: "Books",
    inventory: 110,
    status: "active",
    featured: false,
    createdAt: "2023-03-05T10:45:00Z",
  },
];

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-500">Manage your store products</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Add Product</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            View and manage your product inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductTable products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
