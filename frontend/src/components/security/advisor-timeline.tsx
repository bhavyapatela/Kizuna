"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEVERITY_META } from "@/lib/advisor/meta";
import { cn } from "@/lib/utils";
import type { AdvisorRecommendation } from "@/types";

interface TimelineEvent {
  id: string;
  kind: "completed" | "new";
  title: string;
  timestamp: string;
  color: string;
  impact: number;
}

function toEvents(recommendations: AdvisorRecommendation[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const recommendation of recommendations) {
    if (recommendation.status === "completed" && recommendation.resolvedAt) {
      events.push({
        id: `${recommendation.id}-done`,
        kind: "completed",
        title: recommendation.title,
        timestamp: recommendation.resolvedAt,
        color: "#22c55e",
        impact: recommendation.impact,
      });
    } else if (recommendation.status === "active") {
      events.push({
        id: `${recommendation.id}-new`,
        kind: "new",
        title: recommendation.title,
        timestamp: recommendation.createdAt,
        color: SEVERITY_META[recommendation.severity].color,
        impact: 0,
      });
    }
  }
  return events
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 12);
}

interface AdvisorTimelineProps {
  recommendations: AdvisorRecommendation[] | undefined;
  isLoading: boolean;
}

export function AdvisorTimeline({
  recommendations,
  isLoading,
}: AdvisorTimelineProps) {
  const events = toEvents(recommendations ?? []);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">Timeline</CardTitle>
        <CardDescription>
          What the advisor found — and what you fixed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        ) : (
          <ol className="relative space-y-5 before:absolute before:top-1 before:bottom-1 before:left-[9px] before:w-px before:bg-border">
            {events.map((event, index) => (
              <motion.li
                key={event.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                className="relative flex gap-3 pl-0"
              >
                <span
                  className={cn(
                    "relative z-10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border bg-card",
                  )}
                  style={{ borderColor: `${event.color}66` }}
                  aria-hidden="true"
                >
                  {event.kind === "completed" ? (
                    <Check className="size-3" style={{ color: event.color }} />
                  ) : (
                    <Sparkles
                      className="size-2.5"
                      style={{ color: event.color }}
                    />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-xs leading-snug font-medium">
                    {event.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {event.kind === "completed" ? "Completed" : "Surfaced"}{" "}
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                    })}
                    {event.kind === "completed" && event.impact > 0 && (
                      <span className="ml-1.5 text-success">
                        +{event.impact} pts
                      </span>
                    )}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
