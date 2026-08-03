/**
 * Centralized TanStack Query keys. Always reference these instead of
 * inlining arrays so invalidation stays consistent across the app.
 */
export const queryKeys = {
  currentUser: ["auth", "me"] as const,
  vaults: ["vaults"] as const,
  vault: (vaultId: string) => ["vaults", vaultId] as const,
  vaultItems: (vaultId: string) => ["vaults", vaultId, "items"] as const,
  allItems: ["items"] as const,
  folders: (vaultId: string) => ["vaults", vaultId, "folders"] as const,
  settings: ["settings"] as const,
  advisor: ["advisor", "recommendations"] as const,
  advisorStats: ["advisor", "stats"] as const,
};
