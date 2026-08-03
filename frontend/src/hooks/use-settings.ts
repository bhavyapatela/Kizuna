"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsService } from "@/services/settings";
import { queryKeys } from "@/lib/query-keys";
import type { UpdateSettingsPayload } from "@/types";

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => settingsService.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) =>
      settingsService.updateSettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.settings, settings);
      toast.success("Settings saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to save settings.");
    },
  });
}
