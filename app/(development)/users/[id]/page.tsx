import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserById } from "../_lib/get-user-by-id";

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
      <div>User</div>
      <div className="flex gap-3 [&>a]:underline">
        <Link href={`/users`}>Back</Link>
        <Link href={`/users/${ userRow.id }/edit`}>Edit</Link>
        <Link href={`/users/${ userRow.id }/delete`}>Delete</Link>
      </div>
      <div>
        <p><strong>Id:</strong> { userRow.id }</p>
        <p><strong>Name:</strong> { userRow.name }</p>
        <p><strong>Email:</strong> { userRow.email }</p>
        <p><strong>Email Verified:</strong> { userRow.emailVerified?.toLocaleString() }</p>
        <p><strong>Image:</strong> { userRow.image }</p>
        <p><strong>Role:</strong> { userRow.role }</p>
        <p><strong>Password:</strong> { userRow.password }</p>
        <p><strong>Created At:</strong> { userRow.createdAt?.toLocaleString() }</p>
        <p><strong>Updated At:</strong> { userRow.updatedAt?.toLocaleString() }</p>
      </div>
    </div>
  );
}
