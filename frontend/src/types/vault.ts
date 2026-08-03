export type VaultIcon =
  | "shield"
  | "briefcase"
  | "user"
  | "credit-card"
  | "globe"
  | "server"
  | "heart"
  | "star";

export interface Vault {
  id: string;
  name: string;
  description?: string;
  icon: VaultIcon;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export type VaultItemType = "login" | "card" | "note" | "identity";

export interface VaultItem {
  id: string;
  vaultId: string;
  type: VaultItemType;
  name: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  /** Free-form labels ("2fa", "family", …) — surfaced on the identity map. */
  tags?: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaultPayload {
  name: string;
  description?: string;
  icon: VaultIcon;
}

export type UpdateVaultPayload = Partial<CreateVaultPayload>;

export interface CreateVaultItemPayload {
  vaultId: string;
  type: VaultItemType;
  name: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  favorite?: boolean;
}

export type UpdateVaultItemPayload = Partial<
  Omit<CreateVaultItemPayload, "vaultId">
>;
