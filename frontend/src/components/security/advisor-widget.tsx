"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecommendations } from "@/hooks/use-advisor";
import { SEVERITY_META } from "@/lib/advisor/meta";
import { cn } from "@/lib/utils";

/** Compact "Today's Security Insights" card for the dashboard. */
export function AdvisorWidget() {
  const { data: recommendations, isPending } = useRecommendations();

  const open = (recommendations ?? [])
    .filter((recommendation) => recommendation.status === "active")
    .sort(
      (a, b) =>
        SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order,
    );
  const top = open[0];
  const TopIcon = top ? SEVERITY_META[top.severity].icon : Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden rounded-2xl border-primary/20 py-5">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_120%_at_100%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent)]"
        />
        <CardContent className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold">
                Today&apos;s Security Insights
                {!isPending && (
                  <Badge variant="secondary" className="tabular-nums">
                    {open.length}{" "}
                    {open.length === 1 ? "recommendation" : "recommendations"}
                  </Badge>
                )}
              </p>
              {isPending ? (
                <Skeleton className="mt-1.5 h-4 w-64 max-w-full" />
              ) : top ? (
                <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                  <TopIcon
                    className={cn("size-3.5 shrink-0")}
                    style={{ color: SEVERITY_META[top.severity].color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{top.title}</span>
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  All clear — nothing needs your attention today.
                </p>
              )}
            </div>
          </div>
          <Button asChild className="group shrink-0">
            <Link href="/advisor">
              Review
              <ArrowRight
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
