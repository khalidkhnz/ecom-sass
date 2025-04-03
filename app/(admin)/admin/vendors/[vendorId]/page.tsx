import { notFound } from "next/navigation";
import { getVendorById } from "@/app/actions/vendors";
import { VendorForm } from "../vendor-form";

interface VendorPageProps {
  params: Promise<{ vendorId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { vendorId } = await params;
  const vendor = await getVendorById(vendorId);

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
