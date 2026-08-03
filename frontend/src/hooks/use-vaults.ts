"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { vaultService } from "@/services/vault";
import { queryKeys } from "@/lib/query-keys";
import type { CreateVaultPayload, UpdateVaultPayload } from "@/types";

export function useVaults() {
  return useQuery({
    queryKey: queryKeys.vaults,
    queryFn: () => vaultService.getVaults(),
  });
}

export function useVault(vaultId: string) {
  return useQuery({
    queryKey: queryKeys.vault(vaultId),
    queryFn: () => vaultService.getVault(vaultId),
    enabled: Boolean(vaultId),
  });
}

export function useCreateVault() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVaultPayload) =>
      vaultService.createVault(payload),
    onSuccess: (vault) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vaults });
      toast.success(`Vault "${vault.name}" created`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to create vault.");
    },
  });
}

export function useUpdateVault() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vaultId,
      payload,
    }: {
      vaultId: string;
      payload: UpdateVaultPayload;
    }) => vaultService.updateVault(vaultId, payload),
    onSuccess: (vault) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vaults });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault(vault.id) });
      toast.success("Vault updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update vault.");
    },
  });
}

export function useDeleteVault() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vaultId: string) => vaultService.deleteVault(vaultId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vaults });
      queryClient.invalidateQueries({ queryKey: queryKeys.allItems });
      toast.success("Vault deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to delete vault.");
    },
  });
}
