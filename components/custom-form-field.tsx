import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Button } from "./ui/button";

const CustomFormSelectField = <T extends Record<string, any>>({
  form,
  disabled,
  options = [],
  onValueChange,
  name,
  label,
  placeholder,
  triggerClassName,
  searchMode,
  searchPlaceholder,
  searchTerm,
  onSearchTermChange,
  popoverClassName,
  description,
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
  searchMode?: boolean;
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  popoverClassName?: string;
  description?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [internalSearchTerm, setInternalSearchTerm] = useState(
    searchTerm || ""
  );

  // Handle internal search changes and propagate to parent
  const handleSearchChange = (value: string) => {
    setInternalSearchTerm(value);
    if (onSearchTermChange) {
      onSearchTermChange(value);
    }
  };

  // Get the selected option name for display
  const getSelectedOptionName = (value: string) => {
    const selectedOption = options.find((option) => option.id === value);
    return selectedOption
      ? selectedOption.name
      : placeholder || "Select an option";
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {label && <FormLabel>{label}</FormLabel>}
          <Popover
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              // Reset search when opening
              if (isOpen && onSearchTermChange) {
                onSearchTermChange("");
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn("w-full justify-between", triggerClassName)}
                disabled={disabled}
              >
                {field.value
                  ? getSelectedOptionName(field.value)
                  : placeholder || "Select an option"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={cn("w-full p-0", popoverClassName)}
              align="center"
            >
              <Command shouldFilter={false}>
                {searchMode && (
                  <CommandInput
                    placeholder={searchPlaceholder || "Search..."}
                    value={internalSearchTerm}
                    onValueChange={handleSearchChange}
                    className="h-9"
                  />
                )}
                <CommandList>
                  {options.length === 0 && (
                    <CommandEmpty>No options found</CommandEmpty>
                  )}
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.id}
                        value={option.id}
                        onSelect={(value) => {
                          if (onValueChange) {
                            onValueChange(field, value);
                          } else {
                            field.onChange(value);
                          }
                          setOpen(false);
                        }}
                      >
                        {option.name}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            field.value === option.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { CustomFormSelectField };
