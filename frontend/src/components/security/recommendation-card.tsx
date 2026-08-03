"use client";

import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, EyeOff, ExternalLink, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, SEVERITY_META } from "@/lib/advisor/meta";
import { cn } from "@/lib/utils";
import type { AdvisorRecommendation, AdvisorStatus } from "@/types";

interface RecommendationCardProps {
  recommendation: AdvisorRecommendation;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: AdvisorStatus) => void;
  onReview: () => void;
}

/**
 * One advisor insight. Presentational only — all data shaping and
 * mutations live in the view/hooks layer.
 */
export function RecommendationCard({
  recommendation,
  expanded,
  onToggle,
  onStatusChange,
  onReview,
}: RecommendationCardProps) {
  const severity = SEVERITY_META[recommendation.severity];
  const Icon = severity.icon;
  const isIgnored = recommendation.status === "ignored";
  const isSuccess = recommendation.severity === "success";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "overflow-hidden rounded-2xl border bg-card/70 transition-colors",
        expanded && "border-primary/25 bg-card shadow-lg shadow-primary/5",
        isIgnored && "opacity-55",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            severity.tile,
          )}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {recommendation.title}
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span style={{ color: severity.color }}>{severity.label}</span>
            <span aria-hidden="true">·</span>
            {CATEGORY_LABELS[recommendation.category]}
            <span aria-hidden="true">·</span>
            {formatDistanceToNow(new Date(recommendation.createdAt), {
              addSuffix: true,
            })}
          </span>
        </span>
        {recommendation.impact > 0 && (
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            +{recommendation.impact} pts
          </Badge>
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="space-y-3 px-4 pb-4 pl-16">
              <p className="text-sm text-muted-foreground">
                {recommendation.description}
              </p>
              <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5">
                <p className="text-[11px] font-medium tracking-wide text-primary uppercase">
                  Suggested action
                </p>
                <p className="mt-0.5 text-sm">{recommendation.action}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {isIgnored ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange("active")}
                  >
                    <Undo2 aria-hidden="true" data-icon="inline-start" />
                    Restore
                  </Button>
                ) : (
                  <>
                    <Button size="sm" onClick={onReview}>
                      <ExternalLink aria-hidden="true" data-icon="inline-start" />
                      Review
                    </Button>
                    {!isSuccess && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-success hover:text-success"
                        onClick={() => onStatusChange("completed")}
                      >
                        <Check aria-hidden="true" data-icon="inline-start" />
                        Mark as completed
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => onStatusChange("ignored")}
                    >
                      <EyeOff aria-hidden="true" data-icon="inline-start" />
                      Ignore
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
