import { create } from "zustand";

/**
 * Vault UI state — selection and filtering only. Vault data itself is
 * server state and lives in the TanStack Query cache.
 */
interface VaultState {
  selectedVaultId: string | null;
  searchQuery: string;
  setSelectedVaultId: (vaultId: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  selectedVaultId: null,
  searchQuery: "",
  setSelectedVaultId: (selectedVaultId) => set({ selectedVaultId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
