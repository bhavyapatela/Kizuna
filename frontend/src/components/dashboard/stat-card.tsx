import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Accent treatment for the icon tile. */
  tone?: "default" | "success" | "warning" | "danger";
  isLoading?: boolean;
}

const TONE_STYLES = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  isLoading = false,
}: StatCardProps) {
  return (
    <Card className="rounded-2xl py-5">
      <CardContent className="flex items-center gap-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            TONE_STYLES[tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          {isLoading ? (
            <Skeleton className="mb-1 h-7 w-12" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {value}
            </p>
          )}
          <p className="truncate text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
