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
import { VendorTable } from "./vendor-table";
import Link from "next/link";

export const metadata = {
  title: "Vendors",
  description: "Manage vendors in your marketplace",
};

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendors</h1>
          <p className="text-gray-500">Manage your product vendors</p>
        </div>
        <Button asChild>
          <Link href="/admin/vendors/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>New Vendor</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
          <CardDescription>View and manage all product vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <VendorTable />
        </CardContent>
      </Card>
    </div>
  );
}
