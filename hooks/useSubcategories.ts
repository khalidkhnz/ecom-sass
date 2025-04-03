import { useQuery } from "@tanstack/react-query";
import {
  getSubcategories,
  getSubcategoriesByCategoryId,
} from "@/app/actions/subcategories";

export function useSubcategories() {
  const { data: subcategories, isLoading } = useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const { data, error } = await getSubcategories();
      if (error) throw new Error(error);
      return data;
    },
  });

  return {
    subcategories,
    isLoading,
  };
}

export function useSubcategoriesByCategory(categoryId: string) {
  const { data: subcategories, isLoading } = useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: async () => {
      const { data, error } = await getSubcategoriesByCategoryId(categoryId);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!categoryId,
  });

  return {
    subcategories,
    isLoading,
  };
}
