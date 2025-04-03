import { notFound } from "next/navigation";
import { BrandForm } from "../brand-form";
import { getBrandById } from "@/app/actions/brands";

export const metadata = {
  title: "Edit Brand | Admin Dashboard",
  description: "Edit your store brand",
};

interface BrandEditPageProps {
  params: {
    brandId: string;
  };
}

export default async function BrandEditPage({ params }: BrandEditPageProps) {
  const brand = await getBrandById(params.brandId);

  if (!brand) {
    notFound();
  }

  return (
    <div className="flex-col">
      <div className="container mx-auto py-6">
        <BrandForm initialData={brand} />
      </div>
    </div>
  );
}
