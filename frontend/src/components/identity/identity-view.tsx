"use client";

import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Search, Waypoints } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { IdentityDrawer } from "@/components/identity/identity-drawer";
import { InsightsPanel } from "@/components/identity/insights-panel";
import { useAllItems } from "@/hooks/use-vault-items";
import { useVaults } from "@/hooks/use-vaults";
import { useSettings } from "@/hooks/use-settings";
import {
  ALL_CATEGORIES,
  CATEGORY_META,
  type IdentityCategory,
} from "@/lib/identity/classify";
import {
  computeInsights,
  RELATION_MODES,
  type RelationMode,
} from "@/lib/identity/graph";
import { cn } from "@/lib/utils";
import type { VaultItem } from "@/types";

// The graph (and d3-force) lives in its own chunk — the page shell
// renders immediately and the visualization streams in.
const IdentityGraph = lazy(
  () => import("@/components/identity/identity-graph"),
);

function GraphSkeleton() {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="relative">
        <Skeleton className="size-24 rounded-full" />
        <span className="absolute inset-0 animate-ping rounded-full border border-primary/20" />
      </div>
    </div>
  );
}

export function IdentityView() {
  const { data: items, isPending: itemsPending } = useAllItems();
  const { data: vaults, isPending: vaultsPending } = useVaults();
  const { data: settings } = useSettings();

  const [mode, setMode] = useState<RelationMode>("category");
  const [active, setActive] = useState<IdentityCategory[]>(ALL_CATEGORIES);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<VaultItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLoading = itemsPending || vaultsPending;

  const insights = useMemo(
    () => computeInsights(items ?? [], vaults ?? []),
    [items, vaults],
  );

  const toggleCategory = (category: IdentityCategory) => {
    setActive((current) =>
      current.includes(category)
        ? current.filter((entry) => entry !== category)
        : [...current, category],
    );
  };

  const handleSelect = useCallback((item: VaultItem | null) => {
    setSelected(item);
    setDrawerOpen(Boolean(item));
  }, []);

  const allActive = active.length === ALL_CATEGORIES.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identity Map"
        description="Your digital presence, visualized — every account, connected."
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-60">
          <Search
            className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search identities…"
            className="pl-8"
            aria-label="Search identities"
          />
        </div>

        <Select
          value={mode}
          onValueChange={(value) => setMode(value as RelationMode)}
        >
          <SelectTrigger className="w-44" aria-label="Relationship mode">
            <span className="text-muted-foreground">View by</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RELATION_MODES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Category filters"
        >
          <button
            type="button"
            onClick={() => setActive(ALL_CATEGORIES)}
            aria-pressed={allActive}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              allActive
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {ALL_CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const isActive = active.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                aria-pressed={isActive}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground opacity-60 hover:opacity-100",
                )}
                style={
                  isActive
                    ? {
                        borderColor: `${meta.color}66`,
                        backgroundColor: `${meta.color}1a`,
                      }
                    : undefined
                }
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: meta.color }}
                  aria-hidden="true"
                />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Graph + insights */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="relative h-[540px] overflow-hidden rounded-2xl border bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,color-mix(in_oklab,var(--primary)_7%,transparent),transparent)] xl:h-[620px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_10%,transparent)_1px,transparent_1px)] [background-size:26px_26px]"
          />
          {isLoading ? (
            <GraphSkeleton />
          ) : active.length === 0 ? (
            <div className="flex size-full items-center justify-center p-6">
              <EmptyState
                icon={Waypoints}
                title="Nothing selected"
                description="Turn on at least one category filter to see your identity map."
                className="border-none"
              />
            </div>
          ) : (
            <Suspense fallback={<GraphSkeleton />}>
              <IdentityGraph
                items={items ?? []}
                vaults={vaults ?? []}
                mode={mode}
                categories={active}
                search={search}
                selectedId={drawerOpen ? (selected?.id ?? null) : null}
                showFavicons={settings?.showFavicons ?? true}
                onSelect={handleSelect}
              />
            </Suspense>
          )}
        </div>

        <InsightsPanel insights={insights} isLoading={isLoading} />
      </div>

      <IdentityDrawer
        item={selected}
        vaults={vaults ?? []}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
