import {
  AtSign,
  Gauge,
  Globe,
  History,
  Layers,
  ShieldAlert,
  Vault as VaultIcon,
  type LucideIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { IdentityInsight } from "@/lib/identity/graph";
import { cn } from "@/lib/utils";

const INSIGHT_ICONS: Record<string, LucideIcon> = {
  email: AtSign,
  vault: VaultIcon,
  weakest: ShieldAlert,
  oldest: History,
  provider: Globe,
  category: Layers,
  strength: Gauge,
};

interface InsightsPanelProps {
  insights: IdentityInsight[];
  isLoading: boolean;
}

export function InsightsPanel({ insights, isLoading }: InsightsPanelProps) {
  return (
    <aside aria-label="Identity insights" className="space-y-2">
      <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Insights
      </h2>
      {isLoading
        ? Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-xl" />
          ))
        : insights.map((insight) => {
            const Icon = INSIGHT_ICONS[insight.id] ?? Layers;
            return (
              <div
                key={insight.id}
                className="glass rounded-xl border p-3 transition-colors hover:border-primary/25"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
                      insight.tone === "warning"
                        ? "bg-warning/10 text-warning"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">
                      {insight.label}
                    </p>
                    <p className="truncate text-sm font-semibold">
                      {insight.value}
                    </p>
                    {insight.hint && (
                      <p className="text-[11px] text-muted-foreground">
                        {insight.hint}
                      </p>
                    )}
                    {insight.meter !== undefined && (
                      <Progress
                        value={insight.meter}
                        className="mt-1.5 h-1"
                        aria-label={insight.label}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
    </aside>
  );
}
