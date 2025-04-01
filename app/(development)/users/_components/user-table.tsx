import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sortable } from "@/components/ui/sortable";
import { UserList } from "../_lib/get-user-list";

export function UserTable({ userList }: { userList: UserList }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead><Sortable column="id">Id</Sortable></TableHead>
          <TableHead><Sortable column="name">Name</Sortable></TableHead>
          <TableHead><Sortable column="email">Email</Sortable></TableHead>
          <TableHead><Sortable column="emailVerified">Email Verified</Sortable></TableHead>
          <TableHead><Sortable column="image">Image</Sortable></TableHead>
          <TableHead><Sortable column="role">Role</Sortable></TableHead>
          <TableHead><Sortable column="password">Password</Sortable></TableHead>
          <TableHead><Sortable column="createdAt">Created At</Sortable></TableHead>
          <TableHead><Sortable column="updatedAt">Updated At</Sortable></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        { userList.map((userRow) => (
          <TableRow key={ userRow.id }>
            <TableCell>
              <div className="flex gap-3 [&>a]:underline">
                <Link href={`/users/${ userRow.id }`}>
                  View
                </Link>
                <Link href={`/users/${ userRow.id }/edit`}>
                  Edit
                </Link>
                <Link href={`/users/${ userRow.id }/delete`}>
                  Delete
                </Link>
              </div>
            </TableCell>
            <TableCell>{ userRow.id }</TableCell>
            <TableCell>{ userRow.name }</TableCell>
            <TableCell>{ userRow.email }</TableCell>
            <TableCell>{ userRow.emailVerified?.toLocaleString() }</TableCell>
            <TableCell>{ userRow.image }</TableCell>
            <TableCell>{ userRow.role }</TableCell>
            <TableCell>{ userRow.password }</TableCell>
            <TableCell>{ userRow.createdAt?.toLocaleString() }</TableCell>
            <TableCell>{ userRow.updatedAt?.toLocaleString() }</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
