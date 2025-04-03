import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorStatus,
  type VendorFormValues,
} from "@/app/actions/vendors";
import { toast } from "sonner";

export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  list: (filters: string) => [...vendorKeys.lists(), { filters }] as const,
  details: () => [...vendorKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

export function useVendors() {
  const queryClient = useQueryClient();

  const vendorsQuery = useQuery({
    queryKey: vendorKeys.lists(),
    queryFn: () => getVendors(),
  });

  const createVendorMutation = useMutation({
    mutationFn: (data: VendorFormValues) => createVendor(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Vendor created successfully");
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      } else {
        toast.error(result.error || "Failed to create vendor");
      }
      return result;
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VendorFormValues }) =>
      updateVendor(id, data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Vendor updated successfully");
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      } else {
        toast.error(result.error || "Failed to update vendor");
      }
      return result;
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Vendor deleted successfully");
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      } else {
        toast.error(result.error || "Failed to delete vendor");
      }
      return result;
    },
  });

  const updateVendorStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "pending" | "active" | "suspended";
    }) => updateVendorStatus(id, status),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Vendor status updated successfully");
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      } else {
        toast.error(result.error || "Failed to update vendor status");
      }
      return result;
    },
  });

  return {
    vendors: vendorsQuery.data || [],
    isLoading: vendorsQuery.isLoading,
    isError: vendorsQuery.isError,
    error: vendorsQuery.error,
    createVendor: createVendorMutation.mutateAsync,
    updateVendor: updateVendorMutation.mutateAsync,
    deleteVendor: deleteVendorMutation.mutateAsync,
    updateVendorStatus: updateVendorStatusMutation.mutateAsync,
  };
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => getVendorById(id),
    enabled: !!id,
  });
}
