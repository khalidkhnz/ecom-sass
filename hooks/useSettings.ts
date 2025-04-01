import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSettings,
  updateGeneralSettings,
  updateStoreSettings,
  type GeneralSettingsFormValues,
  type StoreSettingsFormValues,
} from "@/app/actions/settings";
import { toast } from "sonner";
import { ZodIssue } from "zod";

export const settingsKeys = {
  all: ["settings"] as const,
  general: () => [...settingsKeys.all, "general"] as const,
  store: () => [...settingsKeys.all, "store"] as const,
};

export function useSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: settingsKeys.all,
    queryFn: getSettings,
  });

  const updateGeneralSettingsMutation = useMutation({
    mutationFn: (data: GeneralSettingsFormValues) =>
      updateGeneralSettings(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("General settings updated successfully");
        queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      } else {
        if (typeof result.error === "string") {
          toast.error(result.error);
        } else if (Array.isArray(result.error)) {
          const errorMessage = (result.error as ZodIssue[])
            .map((issue) => issue.message)
            .join(", ");
          toast.error(errorMessage || "Failed to update general settings");
        } else {
          toast.error("Failed to update general settings");
        }
      }
      return result;
    },
  });

  const updateStoreSettingsMutation = useMutation({
    mutationFn: (data: StoreSettingsFormValues) => updateStoreSettings(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Store settings updated successfully");
        queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      } else {
        if (typeof result.error === "string") {
          toast.error(result.error);
        } else if (Array.isArray(result.error)) {
          const errorMessage = (result.error as ZodIssue[])
            .map((issue) => issue.message)
            .join(", ");
          toast.error(errorMessage || "Failed to update store settings");
        } else {
          toast.error("Failed to update store settings");
        }
      }
      return result;
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    updateGeneralSettings: updateGeneralSettingsMutation.mutateAsync,
    updateStoreSettings: updateStoreSettingsMutation.mutateAsync,
  };
}
