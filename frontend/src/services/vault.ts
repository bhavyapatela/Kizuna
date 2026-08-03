import { apiFetch, hasBackend } from "@/lib/api-client";
import { delay, demoDb, newId } from "@/lib/demo-db";
import type {
  CreateVaultItemPayload,
  CreateVaultPayload,
  UpdateVaultItemPayload,
  UpdateVaultPayload,
  Vault,
  VaultItem,
} from "@/types";

function now(): string {
  return new Date().toISOString();
}

export const vaultService = {
  async getVaults(): Promise<Vault[]> {
    if (!hasBackend()) {
      await delay();
      return demoDb.getVaults();
    }
    return apiFetch<Vault[]>("/vaults");
  },

  async getVault(vaultId: string): Promise<Vault> {
    if (!hasBackend()) {
      await delay(250);
      const vault = demoDb.getVault(vaultId);
      if (!vault) throw new Error("Vault not found");
      return vault;
    }
    return apiFetch<Vault>(`/vaults/${vaultId}`);
  },

  async createVault(payload: CreateVaultPayload): Promise<Vault> {
    if (!hasBackend()) {
      await delay(500);
      const vault: Vault = {
        id: newId("vault"),
        ...payload,
        itemCount: 0,
        createdAt: now(),
        updatedAt: now(),
      };
      demoDb.setVaults([...demoDb.getVaults(), vault]);
      return vault;
    }
    return apiFetch<Vault>("/vaults", { method: "POST", body: payload });
  },

  async updateVault(
    vaultId: string,
    payload: UpdateVaultPayload,
  ): Promise<Vault> {
    if (!hasBackend()) {
      await delay(400);
      const updated = demoDb
        .getVaults()
        .map((vault) =>
          vault.id === vaultId
            ? { ...vault, ...payload, updatedAt: now() }
            : vault,
        );
      demoDb.setVaults(updated);
      const vault = updated.find((v) => v.id === vaultId);
      if (!vault) throw new Error("Vault not found");
      return vault;
    }
    return apiFetch<Vault>(`/vaults/${vaultId}`, {
      method: "PUT",
      body: payload,
    });
  },

  async deleteVault(vaultId: string): Promise<void> {
    if (!hasBackend()) {
      await delay(400);
      demoDb.setVaults(demoDb.getVaults().filter((v) => v.id !== vaultId));
      demoDb.setItems(demoDb.getItems().filter((i) => i.vaultId !== vaultId));
      return;
    }
    return apiFetch<void>(`/vaults/${vaultId}`, { method: "DELETE" });
  },

  async getItems(vaultId: string): Promise<VaultItem[]> {
    if (!hasBackend()) {
      await delay();
      return demoDb.getItems().filter((item) => item.vaultId === vaultId);
    }
    return apiFetch<VaultItem[]>(`/vaults/${vaultId}/items`);
  },

  async getAllItems(): Promise<VaultItem[]> {
    if (!hasBackend()) {
      await delay();
      return demoDb.getItems();
    }
    return apiFetch<VaultItem[]>("/items");
  },

  async createItem(payload: CreateVaultItemPayload): Promise<VaultItem> {
    if (!hasBackend()) {
      await delay(500);
      const item: VaultItem = {
        id: newId("item"),
        favorite: false,
        ...payload,
        createdAt: now(),
        updatedAt: now(),
      };
      demoDb.setItems([item, ...demoDb.getItems()]);
      return item;
    }
    return apiFetch<VaultItem>(`/vaults/${payload.vaultId}/items`, {
      method: "POST",
      body: payload,
    });
  },

  async updateItem(
    itemId: string,
    payload: UpdateVaultItemPayload,
  ): Promise<VaultItem> {
    if (!hasBackend()) {
      await delay(400);
      const updated = demoDb
        .getItems()
        .map((item) =>
          item.id === itemId ? { ...item, ...payload, updatedAt: now() } : item,
        );
      demoDb.setItems(updated);
      const item = updated.find((i) => i.id === itemId);
      if (!item) throw new Error("Item not found");
      return item;
    }
    return apiFetch<VaultItem>(`/items/${itemId}`, {
      method: "PUT",
      body: payload,
    });
  },

  async deleteItem(itemId: string): Promise<void> {
    if (!hasBackend()) {
      await delay(400);
      demoDb.setItems(demoDb.getItems().filter((i) => i.id !== itemId));
      return;
    }
    return apiFetch<void>(`/items/${itemId}`, { method: "DELETE" });
  },
};
