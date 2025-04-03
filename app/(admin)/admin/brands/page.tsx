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
import { BrandTable } from "./brand-table";
import Link from "next/link";

export const metadata = {
  title: "Brands | Admin Dashboard",
  description: "Manage your store brands",
};

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Brands</h1>
          <p className="text-gray-500">Manage your product brands</p>
        </div>
        <Button asChild>
          <Link href="/admin/brands/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>New Brand</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Brands</CardTitle>
          <CardDescription>View and manage all product brands</CardDescription>
        </CardHeader>
        <CardContent>
          <BrandTable />
        </CardContent>
      </Card>
    </div>
  );
}
