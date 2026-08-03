"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { ShieldCheck, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvisorStatsRow } from "@/components/security/advisor-stats";
import { AdvisorTimeline } from "@/components/security/advisor-timeline";
import { RecommendationCard } from "@/components/security/recommendation-card";
import {
  useAdvisorStats,
  useRecommendations,
  useUpdateRecommendation,
} from "@/hooks/use-advisor";
import { SEVERITY_META } from "@/lib/advisor/meta";
import { cn } from "@/lib/utils";
import type { AdvisorSeverity, AdvisorStatus } from "@/types";

type SeverityFilter = AdvisorSeverity | "all";

const FILTERS: SeverityFilter[] = [
  "all",
  "critical",
  "warning",
  "suggestion",
  "success",
];

export function AdvisorView() {
  const router = useRouter();
  const { data: recommendations, isPending } = useRecommendations();
  const { data: stats, isPending: statsPending } = useAdvisorStats();
  const updateRecommendation = useUpdateRecommendation();

  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [showIgnored, setShowIgnored] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const active = useMemo(
    () =>
      (recommendations ?? [])
        .filter((recommendation) =>
          showIgnored
            ? recommendation.status !== "completed"
            : recommendation.status === "active",
        )
        .filter(
          (recommendation) =>
            filter === "all" || recommendation.severity === filter,
        )
        .sort(
          (a, b) =>
            SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order,
        ),
    [recommendations, filter, showIgnored],
  );

  const counts = useMemo(() => {
    const map = new Map<SeverityFilter, number>([["all", 0]]);
    for (const recommendation of recommendations ?? []) {
      if (recommendation.status !== "active") continue;
      map.set("all", (map.get("all") ?? 0) + 1);
      map.set(
        recommendation.severity,
        (map.get(recommendation.severity) ?? 0) + 1,
      );
    }
    return map;
  }, [recommendations]);

  const ignoredCount = (recommendations ?? []).filter(
    (recommendation) => recommendation.status === "ignored",
  ).length;

  const handleStatus = (id: string, status: AdvisorStatus) => {
    updateRecommendation.mutate({ id, status });
    if (status !== "active") setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Advisor"
        description="An analyst's read on your vault — refreshed with every change you make."
        actions={
          <span className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5 animate-pulse" aria-hidden="true" />
            Analysis up to date
          </span>
        }
      />

      <AdvisorStatsRow stats={stats} isLoading={statsPending} />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="Recommendations" className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((value) => {
              const count = counts.get(value) ?? 0;
              const label =
                value === "all" ? "All" : SEVERITY_META[value].label;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    filter === value
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                  <span className="tabular-nums opacity-60">{count}</span>
                </button>
              );
            })}
            {ignoredCount > 0 && (
              <button
                type="button"
                onClick={() => setShowIgnored((value) => !value)}
                aria-pressed={showIgnored}
                className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {showIgnored ? "Hide" : "Show"} ignored ({ignoredCount})
              </button>
            )}
          </div>

          {isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : active.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="All clear"
              description="No open recommendations in this view. The advisor keeps watching as your vault changes."
            />
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {active.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    expanded={expandedId === recommendation.id}
                    onToggle={() =>
                      setExpandedId((current) =>
                        current === recommendation.id
                          ? null
                          : recommendation.id,
                      )
                    }
                    onStatusChange={(status) =>
                      handleStatus(recommendation.id, status)
                    }
                    onReview={() => router.push(recommendation.reviewHref)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        <AdvisorTimeline
          recommendations={recommendations}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}
