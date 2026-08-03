"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteItem } from "@/hooks/use-vault-items";
import type { VaultItem } from "@/types";

interface DeleteItemDialogProps {
  item: VaultItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteItemDialog({
  item,
  open,
  onOpenChange,
}: DeleteItemDialogProps) {
  const deleteItem = useDeleteItem();

  const handleDelete = () => {
    if (!item) return;
    deleteItem.mutate(
      { itemId: item.id, vaultId: item.vaultId },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{item?.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the item and its credentials from your
            vault. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteItem.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteItem.isPending}
          >
            {deleteItem.isPending ? "Deleting…" : "Delete item"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
