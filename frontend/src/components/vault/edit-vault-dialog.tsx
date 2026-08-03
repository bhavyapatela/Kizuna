"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VaultForm } from "@/components/vault/vault-form";
import { useUpdateVault } from "@/hooks/use-vaults";
import type { Vault } from "@/types";
import type { VaultFormValues } from "@/lib/validations/vault";

interface EditVaultDialogProps {
  vault: Vault;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVaultDialog({
  vault,
  open,
  onOpenChange,
}: EditVaultDialogProps) {
  const updateVault = useUpdateVault();

  const handleSubmit = (values: VaultFormValues) => {
    updateVault.mutate(
      { vaultId: vault.id, payload: values },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit vault</DialogTitle>
          <DialogDescription>
            Rename this vault or change how it appears.
          </DialogDescription>
        </DialogHeader>
        <VaultForm
          defaultValues={{
            name: vault.name,
            description: vault.description ?? "",
            icon: vault.icon,
          }}
          submitLabel="Save changes"
          busyLabel="Saving…"
          isBusy={updateVault.isPending}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
