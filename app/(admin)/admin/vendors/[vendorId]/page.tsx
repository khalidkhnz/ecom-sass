import { notFound } from "next/navigation";
import { getVendorById } from "@/app/actions/vendors";
import { VendorForm } from "../vendor-form";

interface VendorPageProps {
  params: {
    vendorId: string;
  };
}

export default async function VendorPage({ params }: VendorPageProps) {
  const vendor = await getVendorById(params.vendorId);

  if (!vendor) {
    notFound();
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VendorForm initialData={vendor} />
      </div>
    </div>
  );
}
