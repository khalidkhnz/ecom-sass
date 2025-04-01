"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/useSettings";
import { type GeneralSettingsFormValues } from "@/app/actions/settings";
import { Skeleton } from "@/components/ui/skeleton";

// Define form schema with Zod - must match the server-side schema
const generalSettingsSchema = z.object({
  siteName: z
    .string()
    .min(2, { message: "Site name must be at least 2 characters" }),
  siteUrl: z.string().url({ message: "Please enter a valid URL" }),
  adminEmail: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  enableNotifications: z.boolean(),
  enableAnalytics: z.boolean(),
});

export function GeneralSettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settings, isLoading, updateGeneralSettings } = useSettings();

  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: "",
      siteUrl: "",
      adminEmail: "",
      enableNotifications: true,
      enableAnalytics: true,
    },
  });

  // Set form values when settings data is loaded
  useEffect(() => {
    if (settings) {
      form.reset(settings.general);
    }
  }, [settings, form]);

  async function onSubmit(data: GeneralSettingsFormValues) {
    setIsSubmitting(true);
    try {
      await updateGeneralSettings(data);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <GeneralSettingsFormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="siteName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  The name of your website or application
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="siteUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site URL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  The URL of your website (including https://)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adminEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admin Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormDescription>
                  Email address for system notifications
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preferences</h3>

          <FormField
            control={form.control}
            name="enableNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Email Notifications
                  </FormLabel>
                  <FormDescription>
                    Receive email notifications about important events
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableAnalytics"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Analytics</FormLabel>
                  <FormDescription>
                    Collect anonymous usage data to improve your store
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
}

function GeneralSettingsFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        <Skeleton className="h-6 w-32" />

        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-row items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      <Skeleton className="h-10 w-32 mt-6" />
    </div>
  );
}
