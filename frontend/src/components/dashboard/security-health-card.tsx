"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { estimateStrength } from "@/lib/password";
import type { VaultItem } from "@/types";

interface SecurityHealthCardProps {
  items: VaultItem[] | undefined;
  isLoading: boolean;
}

/**
 * Aggregates a simple vault health score from password strength and reuse.
 * All analysis happens client-side — passwords never leave the cache.
 */
export function SecurityHealthCard({
  items,
  isLoading,
}: SecurityHealthCardProps) {
  const health = useMemo(() => {
    const withPasswords = (items ?? []).filter((item) => item.password);
    if (withPasswords.length === 0) {
      return { score: 100, weak: 0, reused: 0, total: 0 };
    }

    const weak = withPasswords.filter(
      (item) => estimateStrength(item.password!).score < 55,
    ).length;

    const counts = new Map<string, number>();
    for (const item of withPasswords) {
      counts.set(item.password!, (counts.get(item.password!) ?? 0) + 1);
    }
    const reused = [...counts.values()]
      .filter((count) => count > 1)
      .reduce((sum, count) => sum + count, 0);

    const penalty =
      (weak / withPasswords.length) * 60 + (reused / withPasswords.length) * 40;

    return {
      score: Math.max(0, Math.round(100 - penalty)),
      weak,
      reused,
      total: withPasswords.length,
    };
  }, [items]);

  const healthy = health.weak === 0 && health.reused === 0;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {healthy ? (
            <ShieldCheck className="size-5 text-success" aria-hidden="true" />
          ) : (
            <ShieldAlert className="size-5 text-warning" aria-hidden="true" />
          )}
          Vault health
        </CardTitle>
        <CardDescription>
          Based on password strength and reuse across{" "}
          {health.total === 1 ? "1 password" : `${health.total} passwords`}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-48" />
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Progress
                value={health.score}
                className="h-2"
                aria-label={`Vault health score: ${health.score} out of 100`}
              />
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {health.score}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span>
                <strong
                  className={
                    health.weak > 0 ? "text-warning" : "text-foreground"
                  }
                >
                  {health.weak}
                </strong>{" "}
                weak
              </span>
              <span>
                <strong
                  className={
                    health.reused > 0 ? "text-warning" : "text-foreground"
                  }
                >
                  {health.reused}
                </strong>{" "}
                reused
              </span>
              {!healthy && (
                <Link
                  href="/generator"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Generate stronger passwords →
                </Link>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
