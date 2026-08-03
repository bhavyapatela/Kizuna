"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VaultForm } from "@/components/vault/vault-form";
import { useCreateVault } from "@/hooks/use-vaults";
import type { VaultFormValues } from "@/lib/validations/vault";

export function CreateVaultDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const createVault = useCreateVault();

  const handleSubmit = (values: VaultFormValues) => {
    createVault.mutate(values, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New vault</DialogTitle>
          <DialogDescription>
            Group related items into their own encrypted space.
          </DialogDescription>
        </DialogHeader>
        <VaultForm
          submitLabel="Create vault"
          busyLabel="Creating…"
          isBusy={createVault.isPending}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
