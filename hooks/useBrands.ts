import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrands, createBrand } from "@/app/actions/products";
import { toast } from "sonner";

export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  list: (filters: string) => [...brandKeys.lists(), { filters }] as const,
  details: () => [...brandKeys.all, "detail"] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};

export function useBrands() {
  const queryClient = useQueryClient();

  const brandsQuery = useQuery({
    queryKey: brandKeys.lists(),
    queryFn: () => getBrands(),
  });

  const createBrandMutation = useMutation({
    mutationFn: (data: {
      name: string;
      slug: string;
      description?: string;
      logo?: string;
      website?: string;
    }) => createBrand(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Brand created successfully");
        queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      } else {
        toast.error(result.error || "Failed to create brand");
      }
      return result;
    },
  });

  return {
    brands: brandsQuery.data || [],
    isLoading: brandsQuery.isLoading,
    isError: brandsQuery.isError,
    error: brandsQuery.error,
    createBrand: createBrandMutation.mutateAsync,
  };
}
