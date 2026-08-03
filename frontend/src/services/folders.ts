import { apiFetch, hasBackend } from "@/lib/api-client";
import { delay, demoDb, newId } from "@/lib/demo-db";
import type { CreateFolderPayload, Folder } from "@/types";

export const foldersService = {
  async getFolders(vaultId: string): Promise<Folder[]> {
    if (!hasBackend()) {
      await delay(250);
      return demoDb.getFolders().filter((f) => f.vaultId === vaultId);
    }
    return apiFetch<Folder[]>(`/vaults/${vaultId}/folders`);
  },

  async createFolder(payload: CreateFolderPayload): Promise<Folder> {
    if (!hasBackend()) {
      await delay(400);
      const folder: Folder = {
        id: newId("folder"),
        ...payload,
        itemCount: 0,
        createdAt: new Date().toISOString(),
      };
      demoDb.setFolders([...demoDb.getFolders(), folder]);
      return folder;
    }
    return apiFetch<Folder>(`/vaults/${payload.vaultId}/folders`, {
      method: "POST",
      body: payload,
    });
  },

  async deleteFolder(folderId: string): Promise<void> {
    if (!hasBackend()) {
      await delay(300);
      demoDb.setFolders(demoDb.getFolders().filter((f) => f.id !== folderId));
      return;
    }
    return apiFetch<void>(`/folders/${folderId}`, { method: "DELETE" });
  },
};
