"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { vaultService } from "@/services/vault";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateVaultItemPayload,
  UpdateVaultItemPayload,
  VaultItem,
} from "@/types";

function invalidateItemQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  vaultId: string,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.vaultItems(vaultId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.allItems });
  queryClient.invalidateQueries({ queryKey: queryKeys.vaults });
}

export function useVaultItems(vaultId: string) {
  return useQuery({
    queryKey: queryKeys.vaultItems(vaultId),
    queryFn: () => vaultService.getItems(vaultId),
    enabled: Boolean(vaultId),
  });
}

export function useAllItems() {
  return useQuery({
    queryKey: queryKeys.allItems,
    queryFn: () => vaultService.getAllItems(),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVaultItemPayload) =>
      vaultService.createItem(payload),
    onSuccess: (item) => {
      invalidateItemQueries(queryClient, item.vaultId);
      toast.success(`"${item.name}" saved`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to save item.");
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateVaultItemPayload;
    }) => vaultService.updateItem(itemId, payload),
    onSuccess: (item) => {
      invalidateItemQueries(queryClient, item.vaultId);
      toast.success(`"${item.name}" updated`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update item.");
    },
  });
}

/** Favorite toggle without a success toast — it's a lightweight action. */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: VaultItem) =>
      vaultService.updateItem(item.id, { favorite: !item.favorite }),
    onSuccess: (item) => {
      invalidateItemQueries(queryClient, item.vaultId);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update favorite.");
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId }: { itemId: string; vaultId: string }) =>
      vaultService.deleteItem(itemId),
    onSuccess: (_data, { vaultId }) => {
      invalidateItemQueries(queryClient, vaultId);
      toast.success("Item deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to delete item.");
    },
  });
}
