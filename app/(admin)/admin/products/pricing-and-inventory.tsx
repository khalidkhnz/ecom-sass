"use client";

import { Heading } from "@/components/ui/heading";
import { FormValues } from "./product-form";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomFormSelectField } from "@/components/custom-form-field";

export default function PricingAndInventoryForm({
  form,
  loading,
}: {
  form: UseFormReturn<FormValues>;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-4">
          <Heading title="Pricing & Inventory" size="sm" />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={loading}
                    placeholder="9.99"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={loading}
                    placeholder="5.99"
                    step="0.01"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Your cost to purchase or produce this item
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={loading}
                    placeholder="7.99"
                    step="0.01"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>Special sale price (optional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="discountStart"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Discount Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={loading}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When the discount should start
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountEnd"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Discount End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={loading}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When the discount should end
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="inventory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventory</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={loading}
                    placeholder="10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Stock Threshold</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={loading}
                    placeholder="5"
                    {...field}
                    value={field.value || 5}
                  />
                </FormControl>
                <FormDescription>
                  Number of items that triggers a low stock warning
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Heading title="Visibility & Status" size="sm" />
          <CustomFormSelectField
            form={form}
            name="status"
            disabled={loading}
            label="Status"
            placeholder="Select product status"
            onValueChange={(field, val) => {
              field.onChange(val);
            }}
            popoverClassName="max-h-[300px] min-w-[300px]"
            triggerClassName="max-w-[300px] min-w-[300px]"
            options={[
              { id: "draft", name: "Draft" },
              { id: "active", name: "Active" },
              { id: "archived", name: "Archived" },
            ]}
            description="Control whether this product is visible to customers"
          />
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured</FormLabel>
                  <FormDescription>
                    Featured products are displayed prominently on your store
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
