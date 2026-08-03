import { z } from "zod";

const VAULT_ICONS = [
  "shield",
  "briefcase",
  "user",
  "credit-card",
  "globe",
  "server",
  "heart",
  "star",
] as const;

export const vaultSchema = z.object({
  name: z
    .string()
    .min(1, "Vault name is required")
    .max(40, "Keep the name under 40 characters"),
  description: z.string().max(120, "Keep the description short").optional(),
  icon: z.enum(VAULT_ICONS),
});

export const vaultItemSchema = z.object({
  type: z.enum(["login", "card", "note", "identity"]),
  name: z.string().min(1, "Name is required").max(60),
  username: z.string().max(120).optional(),
  password: z.string().max(256).optional(),
  url: z
    .union([z.url("Enter a valid URL (include https://)"), z.literal("")])
    .optional(),
  notes: z.string().max(2000).optional(),
});

export type VaultFormValues = z.infer<typeof vaultSchema>;
export type VaultItemFormValues = z.infer<typeof vaultItemSchema>;
