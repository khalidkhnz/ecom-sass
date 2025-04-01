import Link from "next/link";
import { notFound } from "next/navigation";
import { UserUpdateForm } from "../../_components/user-update-form";
import { getUserById } from "../../_lib/get-user-by-id";

type Params = Promise<{ id: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const { id } = params;
  const userRow = await getUserById(id);

  if (!userRow) {
    notFound();
  }


  return (
    <div className="flex flex-col gap-3 p-3">
      <div>Editing User</div>
      <div className="flex gap-3 [&>a]:underline">
        <Link href={`/users`}>Back</Link>
        <Link href={`/users/${ userRow.id }`}>Show</Link>
      </div>
      <div>
        <UserUpdateForm 
          userRow={ userRow }
        />
      </div>
    </div>
  );
}
