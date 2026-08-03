"use client";

import { useCallback, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { DeleteItemDialog } from "@/components/vault/delete-item-dialog";
import { ItemFormSheet } from "@/components/vault/item-form-sheet";
import { ItemTable } from "@/components/vault/item-table";
import { useAllItems } from "@/hooks/use-vault-items";
import { useVaults } from "@/hooks/use-vaults";
import type { VaultItem } from "@/types";

export function FavoritesView() {
  const { data: items, isPending } = useAllItems();
  const { data: vaults } = useVaults();

  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<VaultItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const favorites = useMemo(
    () => items?.filter((item) => item.favorite) ?? [],
    [items],
  );

  const vaultNameOf = useCallback(
    (item: VaultItem) => vaults?.find((v) => v.id === item.vaultId)?.name,
    [vaults],
  );

  const handleEdit = useCallback((item: VaultItem) => {
    setEditingItem(item);
    setSheetOpen(true);
  }, []);

  const handleDelete = useCallback((item: VaultItem) => {
    setDeletingItem(item);
    setDeleteOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Favorites"
        description="Your most-used items, one keystroke away."
      />

      {!isPending && favorites.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No favorites yet"
          description="Star the items you reach for most and they'll be waiting for you here."
        />
      ) : (
        <ItemTable
          items={favorites}
          isLoading={isPending}
          onEdit={handleEdit}
          onDelete={handleDelete}
          vaultNameOf={vaultNameOf}
        />
      )}

      {editingItem && (
        <ItemFormSheet
          vaultId={editingItem.vaultId}
          item={editingItem}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      )}
      <DeleteItemDialog
        item={deletingItem}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
