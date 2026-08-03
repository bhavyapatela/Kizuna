"use client";

import { Plus, Vault as VaultIcon } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CreateVaultDialog } from "@/components/vault/create-vault-dialog";
import { VaultCard } from "@/components/vault/vault-card";
import { useVaults } from "@/hooks/use-vaults";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardMotion = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

export function VaultsView() {
  const { data: vaults, isPending, isError, refetch } = useVaults();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vaults"
        description="Organize your items into separate encrypted spaces."
        actions={
          <CreateVaultDialog>
            <Button>
              <Plus aria-hidden="true" data-icon="inline-start" />
              New vault
            </Button>
          </CreateVaultDialog>
        }
      />

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={VaultIcon}
          title="Couldn't load your vaults"
          description="Something went wrong while fetching your vaults. Check your connection and try again."
          action={<Button onClick={() => refetch()}>Try again</Button>}
        />
      ) : vaults.length === 0 ? (
        <EmptyState
          icon={VaultIcon}
          title="Create your first vault"
          description="Vaults keep related items together — one for personal accounts, one for work, one for anything."
          action={
            <CreateVaultDialog>
              <Button>
                <Plus aria-hidden="true" data-icon="inline-start" />
                New vault
              </Button>
            </CreateVaultDialog>
          }
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {vaults.map((vault) => (
            <motion.div key={vault.id} variants={cardMotion}>
              <VaultCard vault={vault} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
