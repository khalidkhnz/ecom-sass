"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session, refetch } = authClient.useSession();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">
          E-commerce with Next.js and Drizzle
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              await authClient.signOut();
              refetch();
            }}
          >
            Sign Out
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await authClient.signIn.email({
                email: "khankhalid1743@gmail.com",
                password: "khankhalid1743@gmail.com",
                rememberMe: true,
              });
              refetch();
            }}
          >
            Sign In
          </Button>
        </div>
        <pre>
          <code>{JSON.stringify(session, null, 2)}</code>
        </pre>
        <section className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Database Setup</h2>
          <p className="mb-4">
            This application uses Drizzle ORM with PostgreSQL for data
            management. Follow these steps to set up your database:
          </p>

          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>
              Update the <code className="bg-gray-100 px-1 rounded">.env</code>{" "}
              file with your database credentials
            </li>
            <li>
              Run{" "}
              <code className="bg-gray-100 px-1 rounded">
                npm run db:generate
              </code>{" "}
              to generate migrations
            </li>
            <li>
              Run{" "}
              <code className="bg-gray-100 px-1 rounded">
                npm run db:migrate
              </code>{" "}
              to apply migrations
            </li>
            <li>
              Run{" "}
              <code className="bg-gray-100 px-1 rounded">npm run db:seed</code>{" "}
              to populate the database with sample data
            </li>
          </ol>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p>
              You can test the database connection by visiting{" "}
              <a href="/api/db-test" className="text-blue-600 hover:underline">
                /api/db-test
              </a>{" "}
              after completing the setup.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
