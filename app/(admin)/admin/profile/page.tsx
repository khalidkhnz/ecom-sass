import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/schema/users";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth();

  // Get full user data from database
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, session?.user?.id as string),
  });

  if (!userProfile) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Profile</h1>
        <p className="text-gray-500">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage
                src={userProfile.image || ""}
                alt={userProfile.name || "Admin"}
              />
              <AvatarFallback className="text-4xl">
                {userProfile.name?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>

            <div className="w-full space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1">{userProfile.name || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{userProfile.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p className="mt-1 capitalize">{userProfile.role}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Account Created
                </h3>
                <p className="mt-1">
                  {userProfile.createdAt
                    ? new Date(userProfile.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={userProfile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
