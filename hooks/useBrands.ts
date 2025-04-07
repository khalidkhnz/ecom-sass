"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  type BrandFormValues,
} from "@/app/actions/brands";

// Query keys for brands
export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  list: (params: { search?: string; page?: number; limit?: number }) =>
    [...brandKeys.lists(), params] as const,
  details: () => [...brandKeys.all, "detail"] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};

// Hook for fetching brands with pagination and search
export function useBrands(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: brandKeys.list(params || {}),
    queryFn: async () => {
      const result = await getBrands(params);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: (data: BrandFormValues) => createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      toast.success("Brand created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create brand");
    },
  });

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrandFormValues }) =>
      updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      toast.success("Brand updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update brand");
    },
  });

  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      toast.success(
        `Brand deleted successfully${
          result?.productCount
            ? ` (${result?.productCount} products updated)`
            : ""
        }`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete brand");
    },
  });

  return {
    brands: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createBrand: createBrandMutation.mutate,
    updateBrand: updateBrandMutation.mutate,
    deleteBrand: deleteBrandMutation.mutate,
  };
}

// Hook for fetching a single brand
export function useBrand(id: string) {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: async () => {
      const brand = await getBrandById(id);
      if (!brand) {
        throw new Error("Brand not found");
      }
      return brand;
    },
  });
}
