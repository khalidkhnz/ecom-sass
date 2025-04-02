import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductFeatured,
  updateProductStatus,
  type ProductFormValues,
} from "@/app/actions/products";
import { toast } from "sonner";

// Define Product interface
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  sku: string;
  barcode: string | null;
  brandId: string | null;
  price: string;
  costPrice: string | null;
  discountPrice: string | null;
  discountStart: Date | null;
  discountEnd: Date | null;
  inventory: number;
  lowStockThreshold: number;
  soldCount: number;
  status: string;
  featured: boolean;
  categoryId: string | null;
  categoryName: string | null;
  vendorId: string | null;
  tags: string[];
  images: string[];
  attributes: Record<string, any>;
  rating: number;
  reviewCount: number;
  taxable: boolean;
  taxClass: string | null;
  weight: number | null;
  dimensions: { length: number; width: number; height: number } | null;
  shippingClass: string | null;
  visibility: boolean;
  isDigital: boolean;
  fileUrl: string | null;
  labels: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Keys for product queries
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: any) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useProducts() {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: productKeys.lists(),
    queryFn: getProducts,
  });

  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormValues) => createProduct(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Product created successfully");
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      } else {
        toast.error(result.error || "Failed to create product");
      }
      return result;
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormValues }) =>
      updateProduct(id, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success("Product updated successfully");
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(variables.id),
        });
      } else {
        toast.error(result.error || "Failed to update product");
      }
      return result;
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Product deleted successfully");
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      } else {
        toast.error(result.error || "Failed to delete product");
      }
      return result;
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      toggleProductFeatured(id, featured),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success(
          `Product ${variables.featured ? "removed from" : "added to"} featured`
        );
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      } else {
        toast.error(result.error || "Failed to update product");
      }
      return result;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "draft" | "active" | "archived";
    }) => updateProductStatus(id, status),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Product status updated successfully");
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      } else {
        toast.error(result.error || "Failed to update product status");
      }
      return result;
    },
  });

  return {
    products: productsQuery.data || ([] as Product[]),
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    toggleFeatured: toggleFeaturedMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
  };
}
