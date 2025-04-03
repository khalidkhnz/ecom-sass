"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSubcategoriesByCategoryId,
} from "@/app/actions/subcategories";
import { SubcategoryFormValues } from "@/zod/subcategory";

// Query keys for subcategories
export const subcategoryKeys = {
  all: ["subcategories"] as const,
  lists: () => [...subcategoryKeys.all, "list"] as const,
  list: (params: { search?: string; page?: number; limit?: number }) =>
    [...subcategoryKeys.lists(), params] as const,
  details: () => [...subcategoryKeys.all, "detail"] as const,
  detail: (id: string) => [...subcategoryKeys.details(), id] as const,
};

// Hook for fetching subcategories with pagination and search
export function useSubcategories(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: subcategoryKeys.list(params || {}),
    queryFn: async () => {
      const result = await getSubcategories(params);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
  });

  // Create subcategory mutation
  const createSubcategoryMutation = useMutation({
    mutationFn: (data: SubcategoryFormValues) => createSubcategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcategoryKeys.lists() });
      toast.success("Subcategory created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create subcategory");
    },
  });

  // Update subcategory mutation
  const updateSubcategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubcategoryFormValues }) =>
      updateSubcategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcategoryKeys.lists() });
      toast.success("Subcategory updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update subcategory");
    },
  });

  // Delete subcategory mutation
  const deleteSubcategoryMutation = useMutation({
    mutationFn: (id: string) => deleteSubcategory(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: subcategoryKeys.lists() });
      toast.success(
        `Subcategory deleted successfully${
          result.productCount
            ? ` (${result.productCount} products updated)`
            : ""
        }`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete subcategory");
    },
  });

  return {
    subcategories: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createSubcategory: createSubcategoryMutation.mutate,
    updateSubcategory: updateSubcategoryMutation.mutate,
    deleteSubcategory: deleteSubcategoryMutation.mutate,
  };
}

// Hook for fetching a single subcategory
export function useSubcategory(id: string) {
  return useQuery({
    queryKey: subcategoryKeys.detail(id),
    queryFn: async () => {
      const subcategory = await getSubcategoryById(id);
      if (!subcategory) {
        throw new Error("Subcategory not found");
      }
      return subcategory;
    },
  });
}

// Hook for fetching subcategories by category ID
export function useSubcategoriesByCategoryId(categoryId: string) {
  return useQuery({
    queryKey: [...subcategoryKeys.all, "byCategory", categoryId],
    queryFn: async () => {
      const result = await getSubcategoriesByCategoryId(categoryId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    enabled: !!categoryId, // Only run the query if categoryId is provided
  });
}
