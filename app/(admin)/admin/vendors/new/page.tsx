import { VendorForm } from "../vendor-form";

export default function NewVendorPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VendorForm />
      </div>
    </div>
  );
}
