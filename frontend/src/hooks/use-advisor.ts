"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { advisorService } from "@/services/advisor";
import { queryKeys } from "@/lib/query-keys";
import type { AdvisorRecommendation, AdvisorStatus } from "@/types";

export function useRecommendations() {
  return useQuery({
    queryKey: queryKeys.advisor,
    queryFn: () => advisorService.getRecommendations(),
    staleTime: 60 * 1000,
  });
}

export function useAdvisorStats() {
  return useQuery({
    queryKey: queryKeys.advisorStats,
    queryFn: () => advisorService.getStats(),
    staleTime: 60 * 1000,
  });
}

export function useUpdateRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdvisorStatus }) =>
      advisorService.updateStatus(id, status),
    // Optimistic: the card animates away immediately.
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.advisor });
      const previous = queryClient.getQueryData<AdvisorRecommendation[]>(
        queryKeys.advisor,
      );
      queryClient.setQueryData<AdvisorRecommendation[]>(
        queryKeys.advisor,
        (current) =>
          current?.map((recommendation) =>
            recommendation.id === id
              ? {
                  ...recommendation,
                  status,
                  resolvedAt:
                    status === "completed"
                      ? new Date().toISOString()
                      : recommendation.resolvedAt,
                }
              : recommendation,
          ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.advisor, context.previous);
      }
      toast.error("Couldn't update the recommendation.");
    },
    onSuccess: (recommendation, { status }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.advisorStats });
      if (status === "completed") {
        const points = recommendation?.impact ?? 0;
        toast.success(
          points > 0
            ? `Nice work — security score +${points}`
            : "Marked as completed",
        );
      } else if (status === "ignored") {
        toast("Recommendation dismissed");
      }
    },
  });
}
