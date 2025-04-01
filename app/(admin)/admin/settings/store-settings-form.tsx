"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import { type StoreSettingsFormValues } from "@/app/actions/settings";
import { Skeleton } from "@/components/ui/skeleton";

// Define form schema with Zod - must match the server-side schema
const storeSettingsSchema = z.object({
  storeName: z
    .string()
    .min(2, { message: "Store name must be at least 2 characters" }),
  storeDescription: z.string().optional(),
  contactEmail: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  contactPhone: z.string().optional(),
  currency: z.string().min(1, { message: "Please select a currency" }),
  enableGuestCheckout: z.boolean(),
  enableAutomaticTax: z.boolean(),
  maxProductsPerOrder: z.number().int().positive(),
  shippingFrom: z.string().optional(),
});

export function StoreSettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settings, isLoading, updateStoreSettings } = useSettings();

  const form = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      contactEmail: "",
      contactPhone: "",
      currency: "INR",
      maxProductsPerOrder: 10,
      shippingFrom: "",
      enableGuestCheckout: true,
      enableAutomaticTax: false,
    },
  });

  // Set form values when settings data is loaded
  useEffect(() => {
    if (settings) {
      form.reset(settings.store);
    }
  }, [settings, form]);

  async function onSubmit(data: StoreSettingsFormValues) {
    setIsSubmitting(true);
    try {
      await updateStoreSettings(data);
    } catch (error) {
      console.error("Error saving store settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <StoreSettingsFormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="storeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>The name of your online store</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="storeDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  A short description used in search results and store listings
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormDescription>
                    Public email for customer inquiries
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Public phone number (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">
                        AUD - Australian Dollar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The currency used for all transactions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxProductsPerOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Products Per Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of items per order
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="shippingFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping From</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  Primary shipping location (country)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store Options</CardTitle>
            <CardDescription>
              Configure checkout and tax options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="enableGuestCheckout"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <FormLabel>Guest Checkout</FormLabel>
                    <FormDescription>
                      Allow customers to checkout without creating an account
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
              name="enableAutomaticTax"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <FormLabel>Automatic Tax Calculation</FormLabel>
                    <FormDescription>
                      Automatically calculate taxes based on customer location
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
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Store Settings"}
        </Button>
      </form>
    </Form>
  );
}

function StoreSettingsFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-28" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between space-x-2"
            >
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Skeleton className="h-10 w-44" />
    </div>
  );
}
