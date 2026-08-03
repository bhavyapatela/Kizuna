"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/shared/copy-button";
import { ITEM_TYPE_META } from "@/constants/vault";
import type { VaultItem } from "@/types";

interface RecentItemsCardProps {
  items: VaultItem[] | undefined;
  isLoading: boolean;
}

export function RecentItemsCard({ items, isLoading }: RecentItemsCardProps) {
  const recent = useMemo(
    () =>
      [...(items ?? [])]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5),
    [items],
  );

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5 text-muted-foreground" aria-hidden="true" />
          Recently updated
        </CardTitle>
        <CardDescription>Pick up where you left off.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ul className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <li key={index} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="ml-auto h-3 w-20" />
              </li>
            ))}
          </ul>
        ) : recent.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            Items you add will show up here.
          </p>
        ) : (
          <ul className="-mx-2">
            {recent.map((item) => {
              const TypeIcon = ITEM_TYPE_META[item.type].icon;
              return (
                <li key={item.id} className="group/recent relative">
                  <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors group-hover/recent:bg-accent/60">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                      <TypeIcon
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/vaults/${item.vaultId}`}
                        className="truncate text-sm font-medium outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {item.password && (
                      <CopyButton
                        value={item.password}
                        label="Password"
                        className="relative z-10 opacity-0 transition-opacity group-focus-within/recent:opacity-100 group-hover/recent:opacity-100"
                      />
                    )}
                    <ArrowRight
                      className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover/recent:opacity-100"
                      aria-hidden="true"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
