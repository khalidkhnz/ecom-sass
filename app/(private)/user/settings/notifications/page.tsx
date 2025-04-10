"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Mail,
  ShoppingBag,
  Tag,
  Gift,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserNotificationSettings,
  updateUserNotificationSettings,
  type UserNotificationSettingsFormValues,
} from "@/app/actions/settings";

export default function NotificationsPage() {
  // local state for notification settings
  const [settings, setSettings] = useState<UserNotificationSettingsFormValues>({
    emailNotifications: true,
    orderUpdates: true,
    shippingUpdates: true,
    deliveryUpdates: true,
    marketingEmails: false,
    productRecommendations: false,
    salesAndPromotions: false,
    backInStock: true,
    priceDrops: true,
    securityAlerts: true,
    accountActivity: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load user notification settings on page load
  useEffect(() => {
    async function loadSettings() {
      try {
        const result = await getUserNotificationSettings();
        if (result.success && result.settings) {
          setSettings(result.settings);
        } else {
          toast.error("Failed to load notification settings", {
            description: (result?.error as string) || "Please try again later",
          });
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
        toast.error("Error loading settings", {
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  // handle toggle change
  const handleToggle = (setting: keyof typeof settings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  // save notification preferences
  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserNotificationSettings(settings);

      if (result.success) {
        toast.success("Notification preferences saved successfully");
      } else {
        toast.error("Failed to save notification settings", {
          description: (result?.error as string) || "Please try again later",
        });
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Error saving settings", {
        description: "Please try again later",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">
            Loading notification settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Notification Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage how you receive notifications and updates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Control the emails you receive from us
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">
                All Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all email notifications
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>
          <Separator />
          <div
            className={
              settings.emailNotifications
                ? "space-y-4"
                : "space-y-4 opacity-50 pointer-events-none"
            }
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-start gap-2">
                <ShoppingBag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <Label htmlFor="order-updates">Order Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about order confirmations and status changes
                  </p>
                </div>
              </div>
              <Switch
                id="order-updates"
                checked={settings.orderUpdates}
                onCheckedChange={() => handleToggle("orderUpdates")}
                disabled={!settings.emailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-start gap-2">
                <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <Label htmlFor="shipping-updates">Shipping Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your order has been shipped
                  </p>
                </div>
              </div>
              <Switch
                id="shipping-updates"
                checked={settings.shippingUpdates}
                onCheckedChange={() => handleToggle("shippingUpdates")}
                disabled={!settings.emailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-start gap-2">
                <Gift className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <Label htmlFor="delivery-updates">Delivery Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your order has been delivered
                  </p>
                </div>
              </div>
              <Switch
                id="delivery-updates"
                checked={settings.deliveryUpdates}
                onCheckedChange={() => handleToggle("deliveryUpdates")}
                disabled={!settings.emailNotifications}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Marketing Communications
          </CardTitle>
          <CardDescription>
            Control marketing and promotional emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new products, features and offers
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={settings.marketingEmails}
              onCheckedChange={() => handleToggle("marketingEmails")}
            />
          </div>
          <Separator />
          <div
            className={
              settings.marketingEmails
                ? "space-y-4"
                : "space-y-4 opacity-50 pointer-events-none"
            }
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="product-recommendations">
                  Product Recommendations
                </Label>
                <p className="text-sm text-muted-foreground">
                  Personalized product recommendations based on your interests
                </p>
              </div>
              <Switch
                id="product-recommendations"
                checked={settings.productRecommendations}
                onCheckedChange={() => handleToggle("productRecommendations")}
                disabled={!settings.marketingEmails}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sales-promotions">Sales &amp; Promotions</Label>
                <p className="text-sm text-muted-foreground">
                  Special offers, discounts and promotional campaigns
                </p>
              </div>
              <Switch
                id="sales-promotions"
                checked={settings.salesAndPromotions}
                onCheckedChange={() => handleToggle("salesAndPromotions")}
                disabled={!settings.marketingEmails}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Product Alerts
          </CardTitle>
          <CardDescription>
            {`Get notified about products you're interested in`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="back-in-stock">Back in Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Notifications when out-of-stock products become available
              </p>
            </div>
            <Switch
              id="back-in-stock"
              checked={settings.backInStock}
              onCheckedChange={() => handleToggle("backInStock")}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="price-drops">Price Drop Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when items in your wishlist go on sale
              </p>
            </div>
            <Switch
              id="price-drops"
              checked={settings.priceDrops}
              onCheckedChange={() => handleToggle("priceDrops")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Notifications
          </CardTitle>
          <CardDescription>
            Important alerts about your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="security-alerts">Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about suspicious activity or login attempts
              </p>
            </div>
            <Switch
              id="security-alerts"
              checked={settings.securityAlerts}
              onCheckedChange={() => handleToggle("securityAlerts")}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="account-activity">Account Activity</Label>
              <p className="text-sm text-muted-foreground">
                Notifications about changes to your account settings
              </p>
            </div>
            <Switch
              id="account-activity"
              checked={settings.accountActivity}
              onCheckedChange={() => handleToggle("accountActivity")}
            />
          </div>
          <div className="mt-4 text-sm text-muted-foreground p-3 bg-muted/20 rounded-md">
            <p>
              <strong>Note:</strong> For your security, some critical
              notifications cannot be disabled.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  );
}
