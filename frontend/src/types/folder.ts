export interface Folder {
  id: string;
  vaultId: string;
  name: string;
  itemCount: number;
  createdAt: string;
}

export interface CreateFolderPayload {
  vaultId: string;
  name: string;
}
