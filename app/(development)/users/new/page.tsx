import Link from "next/link";
import { UserCreateForm } from "../_components/user-create-form";

export default async function Page() {

  return (
    <div className="flex flex-col gap-3 p-3">
      <div>New User</div>
      <div className="[&>a]:underline">
        <Link href={`/users`}>Back</Link>
      </div>
      <div>
        <UserCreateForm 
        />
      </div>
    </div>
  );
}
