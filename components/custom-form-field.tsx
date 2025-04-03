import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { Path } from "react-hook-form";
import { cn } from "@/lib/utils";

const CustomFormSelectField = <T extends Record<string, any>>({
  form,
  disabled,
  options = [],
  onValueChange,
  name,
  label,
  placeholder,
  triggerClassName,
}: {
  form: UseFormReturn<T>;
  disabled?: boolean;
  options?: { id: string; name: string }[];
  onValueChange?: (
    filed: ControllerRenderProps<T, Path<T>>,
    value: string
  ) => void;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  triggerClassName?: string;
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            disabled={disabled}
            onValueChange={(...props) => {
              if (onValueChange) {
                onValueChange(field, ...props);
              } else {
                field.onChange(...props);
              }
            }}
            value={field.value || ""}
          >
            <FormControl>
              <SelectTrigger className={cn("w-[200px]", triggerClassName)}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options?.map((option: any) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { CustomFormSelectField };
