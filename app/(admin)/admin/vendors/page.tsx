import { Suspense } from "react";
import { VendorsClient } from "./vendors-client";
import { getVendors } from "@/app/actions/vendors";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Vendors",
  description: "Manage vendors in your marketplace",
};

export default async function VendorsPage() {
  const vendors = await getVendors();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={`Vendors (${vendors.length})`}
            description="Manage your marketplace vendors"
          />
          <Button asChild>
            <Link href="/admin/vendors/new">
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Link>
          </Button>
        </div>
        <Separator className="my-4" />
        <Suspense fallback={<div>Loading vendors...</div>}>
          <VendorsClient data={vendors} />
        </Suspense>
      </div>
    </div>
  );
}
