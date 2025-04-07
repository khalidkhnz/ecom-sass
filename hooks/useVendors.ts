"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
} from "@/app/actions/vendors";
import { VendorFormValues } from "@/zod/vendor";

// Query keys for vendors
export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  list: (params: { search?: string; page?: number; limit?: number }) =>
    [...vendorKeys.lists(), params] as const,
  details: () => [...vendorKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

// Hook for fetching vendors with pagination and search
export function useVendors(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: vendorKeys.list(params || {}),
    queryFn: async () => {
      const result = await getVendors(params);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
  });

  // Create vendor mutation
  const createVendorMutation = useMutation({
    mutationFn: (data: VendorFormValues) => createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      toast.success("Vendor created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create vendor");
    },
  });

  // Update vendor mutation
  const updateVendorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VendorFormValues }) =>
      updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      toast.success("Vendor updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update vendor");
    },
  });

  // Delete vendor mutation
  const deleteVendorMutation = useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      toast.success(
        `Vendor deleted successfully${
          result?.productCount
            ? ` (${result?.productCount} products updated)`
            : ""
        }`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete vendor");
    },
  });

  return {
    vendors: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createVendor: createVendorMutation.mutate,
    updateVendor: updateVendorMutation.mutate,
    deleteVendor: deleteVendorMutation.mutate,
  };
}

// Hook for fetching a single vendor
export function useVendor(id: string) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: async () => {
      const vendor = await getVendorById(id);
      if (!vendor) {
        throw new Error("Vendor not found");
      }
      return vendor;
    },
  });
}
