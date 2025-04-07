"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryFormValues,
} from "@/app/actions/categories";
import { toast } from "sonner";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters: { search?: string; page?: number; limit?: number }) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategories(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.list(params || {}),
    queryFn: async () => {
      const result = await getCategories(params);
      if (result.error) throw new Error(result.error);
      return result;
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormValues) => createCategory(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Category created successfully");
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      } else {
        toast.error(result.error || "Failed to create category");
      }
      return result;
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormValues }) =>
      updateCategory(id, data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Category updated successfully");
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      } else {
        toast.error(result.error || "Failed to update category");
      }
      return result;
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (result: any) => {
      if (result.success) {
        toast.success(
          `Category deleted successfully${
            result?.productCount
              ? `. ${result?.productCount} products updated.`
              : ""
          }`
        );
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      } else {
        toast.error(result.error || "Failed to delete category");
      }
      return result;
    },
  });

  return {
    categories: categoriesQuery.data?.data || [],
    pagination: categoriesQuery.data?.pagination,
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
  };
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  });
}
