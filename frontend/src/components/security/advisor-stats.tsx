"use client";

import {
  CalendarClock,
  CheckCheck,
  CopyX,
  ShieldOff,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AdvisorStats } from "@/types";

interface StatTile {
  key: string;
  label: string;
  value: (stats: AdvisorStats) => string;
  icon: LucideIcon;
  tone?: (stats: AdvisorStats) => "default" | "warning" | "success";
}

const TILES: StatTile[] = [
  {
    key: "resolved",
    label: "Recommendations resolved",
    value: (stats) => String(stats.resolvedCount),
    icon: CheckCheck,
    tone: () => "success",
  },
  {
    key: "improvements",
    label: "Security improvements",
    value: (stats) => `+${stats.improvementPoints} pts`,
    icon: TrendingUp,
    tone: () => "success",
  },
  {
    key: "age",
    label: "Average password age",
    value: (stats) => `${stats.averagePasswordAgeDays}d`,
    icon: CalendarClock,
  },
  {
    key: "reused",
    label: "Reused passwords",
    value: (stats) => String(stats.reusedPasswords),
    icon: CopyX,
    tone: (stats) => (stats.reusedPasswords > 0 ? "warning" : "success"),
  },
  {
    key: "weak",
    label: "Weak passwords",
    value: (stats) => String(stats.weakPasswords),
    icon: ShieldOff,
    tone: (stats) => (stats.weakPasswords > 0 ? "warning" : "success"),
  },
];

const TONE_TILE = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
};

/** Single-series score trend — line + soft area, hover markers. */
function TrendChart({ stats }: { stats: AdvisorStats }) {
  const points = stats.trend;
  const width = 260;
  const height = 72;
  const padding = 6;
  const min = Math.min(...points.map((point) => point.score)) - 6;
  const max = Math.max(...points.map((point) => point.score)) + 6;

  const x = (index: number) =>
    padding + (index / (points.length - 1)) * (width - padding * 2);
  const y = (score: number) =>
    height - padding - ((score - min) / (max - min)) * (height - padding * 2);

  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(point.score).toFixed(1)}`,
    )
    .join(" ");
  const area = `${path} L${x(points.length - 1).toFixed(1)},${height - padding} L${x(0).toFixed(1)},${height - padding} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={`Security score trend, currently ${stats.currentScore} out of 100`}
    >
      <defs>
        <linearGradient id="advisor-trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#advisor-trend-fill)" />
      <path
        d={path}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((point, index) => (
        <circle
          key={point.label}
          cx={x(index)}
          cy={y(point.score)}
          r={index === points.length - 1 ? 3.5 : 8}
          fill={index === points.length - 1 ? "var(--primary)" : "transparent"}
          stroke={index === points.length - 1 ? "var(--card)" : "none"}
          strokeWidth="1.5"
          className="cursor-default"
        >
          <title>{`${point.label}: ${point.score}/100`}</title>
        </circle>
      ))}
    </svg>
  );
}

interface AdvisorStatsRowProps {
  stats: AdvisorStats | undefined;
  isLoading: boolean;
}

export function AdvisorStatsRow({ stats, isLoading }: AdvisorStatsRowProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton
            key={index}
            className={cn("h-24 rounded-2xl", index === 5 && "xl:col-span-1")}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6"
    >
      {TILES.map((tile) => {
        const tone = tile.tone?.(stats) ?? "default";
        return (
          <motion.div
            key={tile.key}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <Card className="h-full rounded-2xl py-4">
              <CardContent className="px-4">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg",
                    TONE_TILE[tone],
                  )}
                >
                  <tile.icon className="size-3.5" aria-hidden="true" />
                </span>
                <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums">
                  {tile.value(stats)}
                </p>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {tile.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        className="sm:col-span-2 xl:col-span-1"
      >
        <Card className="h-full rounded-2xl py-4">
          <CardContent className="px-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xl font-semibold tracking-tight tabular-nums">
                {stats.currentScore}
              </p>
              <p className="text-[11px] text-muted-foreground">/ 100</p>
            </div>
            <p className="text-[11px] text-muted-foreground">Security score</p>
            <div className="mt-1">
              <TrendChart stats={stats} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
