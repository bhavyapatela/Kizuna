"use client";

import { KeyRound, Star, Vault as VaultIcon } from "lucide-react";
import { motion } from "motion/react";
import { RecentItemsCard } from "@/components/dashboard/recent-items-card";
import { SecurityHealthCard } from "@/components/dashboard/security-health-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { AdvisorWidget } from "@/components/security/advisor-widget";
import { useCurrentUser } from "@/hooks/use-auth";
import { useAllItems } from "@/hooks/use-vault-items";
import { useVaults } from "@/hooks/use-vaults";

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardView() {
  const { data: user } = useCurrentUser();
  const { data: vaults, isPending: vaultsPending } = useVaults();
  const { data: items, isPending: itemsPending } = useAllItems();

  const favoriteCount = items?.filter((item) => item.favorite).length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greetingFor(new Date())}
          {user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s the state of your vault today.
        </p>
      </div>

      <AdvisorWidget />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Items secured"
          value={items?.length ?? 0}
          icon={KeyRound}
          isLoading={itemsPending}
        />
        <StatCard
          label="Vaults"
          value={vaults?.length ?? 0}
          icon={VaultIcon}
          isLoading={vaultsPending}
        />
        <StatCard
          label="Favorites"
          value={favoriteCount}
          icon={Star}
          tone="warning"
          isLoading={itemsPending}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SecurityHealthCard items={items} isLoading={itemsPending} />
        <RecentItemsCard items={items} isLoading={itemsPending} />
      </div>
    </motion.div>
  );
}
