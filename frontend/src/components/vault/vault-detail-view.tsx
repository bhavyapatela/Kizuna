"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteItemDialog } from "@/components/vault/delete-item-dialog";
import { DeleteVaultDialog } from "@/components/vault/delete-vault-dialog";
import { EditVaultDialog } from "@/components/vault/edit-vault-dialog";
import { ItemFormSheet } from "@/components/vault/item-form-sheet";
import { ItemTable } from "@/components/vault/item-table";
import { VAULT_ICONS } from "@/constants/vault";
import { useVault } from "@/hooks/use-vaults";
import { useVaultItems } from "@/hooks/use-vault-items";
import { useVaultStore } from "@/store/vault-store";
import type { VaultItem } from "@/types";

export function VaultDetailView({ vaultId }: { vaultId: string }) {
  const { data: vault, isPending: vaultPending } = useVault(vaultId);
  const { data: items, isPending: itemsPending } = useVaultItems(vaultId);
  const setSelectedVaultId = useVaultStore((state) => state.setSelectedVaultId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<VaultItem | null>(null);
  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [editVaultOpen, setEditVaultOpen] = useState(false);
  const [deleteVaultOpen, setDeleteVaultOpen] = useState(false);

  // Track the vault the user is currently working in.
  useEffect(() => {
    setSelectedVaultId(vaultId);
    return () => setSelectedVaultId(null);
  }, [vaultId, setSelectedVaultId]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setSheetOpen(true);
  }, []);

  const handleEdit = useCallback((item: VaultItem) => {
    setEditingItem(item);
    setSheetOpen(true);
  }, []);

  const handleDelete = useCallback((item: VaultItem) => {
    setDeletingItem(item);
    setDeleteItemOpen(true);
  }, []);

  if (vaultPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!vault) return null;

  const Icon = VAULT_ICONS[vault.icon];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
            <Icon className="size-6 text-primary" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {vault.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {vault.description || "No description"} · Updated{" "}
              {formatDistanceToNow(new Date(vault.updatedAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={handleAdd}>
            <Plus aria-hidden="true" data-icon="inline-start" />
            Add item
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Vault actions"
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditVaultOpen(true)}>
                <Pencil aria-hidden="true" /> Edit vault
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteVaultOpen(true)}
              >
                <Trash2 aria-hidden="true" /> Delete vault
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ItemTable
        items={items ?? []}
        isLoading={itemsPending}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyAction={
          <Button onClick={handleAdd}>
            <Plus aria-hidden="true" data-icon="inline-start" />
            Add your first item
          </Button>
        }
      />

      <ItemFormSheet
        vaultId={vaultId}
        item={editingItem}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
      <DeleteItemDialog
        item={deletingItem}
        open={deleteItemOpen}
        onOpenChange={setDeleteItemOpen}
      />
      <EditVaultDialog
        vault={vault}
        open={editVaultOpen}
        onOpenChange={setEditVaultOpen}
      />
      <DeleteVaultDialog
        vault={vault}
        open={deleteVaultOpen}
        onOpenChange={setDeleteVaultOpen}
        redirectTo="/vaults"
      />
    </div>
  );
}
