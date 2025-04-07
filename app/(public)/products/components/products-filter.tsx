"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Category } from "@/schema/categories";

interface ProductsFilterProps {
  categories: Category[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ProductsFilter({
  categories,
  searchParams,
}: ProductsFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentSearchParams = useSearchParams();

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(
        currentSearchParams?.toString() || ""
      );

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      return newSearchParams.toString();
    },
    [currentSearchParams]
  );

  const handleValueChange = useCallback(
    (key: string, value: string | null) => {
      startTransition(() => {
        router.push(
          `?${createQueryString({
            [key]: value,
          })}`
        );
      });
    },
    [router, createQueryString]
  );

  const category = searchParams?.category?.toString() || null;
  const query = searchParams?.query?.toString() || "";
  const inStock = searchParams?.inStock?.toString() || "";
  const sort = searchParams?.sort?.toString() || null;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 gap-4">
        <Select
          value={category || undefined}
          onValueChange={(value) =>
            handleValueChange("category", value || null)
          }
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search products..."
          className="w-full md:w-[300px]"
          value={query}
          onChange={(e) => handleValueChange("query", e.target.value || null)}
        />
      </div>
      <div className="flex items-center gap-4">
        <Select
          value={sort || undefined}
          onValueChange={(value) => handleValueChange("sort", value || null)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-asc">Price: Low to high</SelectItem>
            <SelectItem value="price-desc">Price: High to low</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={inStock === "true" ? "default" : "outline"}
          onClick={() =>
            handleValueChange("inStock", inStock === "true" ? "" : "true")
          }
        >
          In stock only
        </Button>
      </div>
    </div>
  );
}
