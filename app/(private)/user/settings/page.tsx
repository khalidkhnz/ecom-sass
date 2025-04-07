import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Bell,
  CreditCard,
  MapPin,
  ShieldCheck,
  CornerUpRight,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Personal Details</p>
                  <p className="text-sm text-muted-foreground">
                    Update your name, email, and profile picture
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/user/profile">
                    <CornerUpRight className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Change your password
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/user/settings/password">
                    <CornerUpRight className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive order updates and promotional emails
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new products and offers
                  </p>
                </div>
                <Switch id="marketing" />
              </div>
              <div className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/user/settings/notifications">
                    Manage all notification settings
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses
            </CardTitle>
            <CardDescription>Manage your shipping addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Default Shipping Address</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You haven't set a default shipping address yet.
                </p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/user/settings/addresses">Manage addresses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Manage your payment options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Saved Payment Methods</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You haven't saved any payment methods yet.
                </p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/user/settings/payment-methods">
                  Manage payment methods
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Secure your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch id="two-factor" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="session-timeout">Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>
                <Switch id="session-timeout" defaultChecked />
              </div>
              <div className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/user/settings/security">
                    Manage security settings
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize your display preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark mode
                  </p>
                </div>
                <Switch id="dark-mode" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce the amount of animations
                  </p>
                </div>
                <Switch id="reduced-motion" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
