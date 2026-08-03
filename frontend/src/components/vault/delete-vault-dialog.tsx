"use client";

import { useRouter } from "next/navigation";
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
import { useDeleteVault } from "@/hooks/use-vaults";
import type { Vault } from "@/types";

interface DeleteVaultDialogProps {
  vault: Vault;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Navigate away after deleting (used from the vault detail page). */
  redirectTo?: string;
}

export function DeleteVaultDialog({
  vault,
  open,
  onOpenChange,
  redirectTo,
}: DeleteVaultDialogProps) {
  const router = useRouter();
  const deleteVault = useDeleteVault();

  const handleDelete = () => {
    deleteVault.mutate(vault.id, {
      onSuccess: () => {
        onOpenChange(false);
        if (redirectTo) router.push(redirectTo);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{vault.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the vault and all{" "}
            {vault.itemCount === 1 ? "1 item" : `${vault.itemCount} items`}{" "}
            inside it. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteVault.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteVault.isPending}
          >
            {deleteVault.isPending ? "Deleting…" : "Delete vault"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
