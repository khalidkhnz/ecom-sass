import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/app/actions/products";
import { productKeys } from "@/hooks/useProducts";

export function useProduct(productId: string) {
  const enabled = !!productId;

  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductById(productId),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
