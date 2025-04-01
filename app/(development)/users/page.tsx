import Link from "next/link";
import { like } from "drizzle-orm";
import { db } from "@/lib/db";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { parseSearchParams } from "@/lib/search-params";
import { users } from "@/schema/users";
import { UserTable } from "./_components/user-table";
import { getUserList } from "./_lib/get-user-list";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const {
    page = 1,
    pageIndex = 0,
    pageSize = 10,
    search,
    sortKey = "createdAt",
    sortOrder = "desc",
  } = parseSearchParams(searchParams);
  const filters = search ? like(users.id, `%${search}%`) : undefined;
  const count = await db.$count(users, filters);
  const totalPages = Math.ceil(count / pageSize);
  const userList = await getUserList({
    filters: filters,
    sortKey: sortKey,
    sortOrder: sortOrder,
    limit: pageSize,
    offset: pageIndex * pageSize,
  });

  return (
    <div className="flex flex-col gap-3 p-3">
      <div>Users</div>
      <div className="flex justify-between">
        <SearchInput />
        <Link href="/users/new">
          <Button variant="info">New</Button>
        </Link>
      </div>
      <div className="overflow-auto">
        <UserTable userList={ userList } />
      </div>
      <div>
        <Pagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          count={count}
        />
      </div>
    </div>
  );
}
