import { BrandForm } from "../brand-form";

export const metadata = {
  title: "Create Brand | Admin Dashboard",
  description: "Add a new brand to your store",
};

export default function NewBrandPage() {
  return (
    <div className="flex-col">
      <div className="container mx-auto py-6">
        <BrandForm />
      </div>
    </div>
  );
}
