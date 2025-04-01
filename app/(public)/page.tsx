import { auth } from "@/lib/auth";

const Page = async () => {
  const session = await auth();

  return (
    <div>
      <h1>Public Page</h1>
      <pre>
        <code>{JSON.stringify(session, null, 2)}</code>
      </pre>
    </div>
  );
};

export default Page;
