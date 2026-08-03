import type { Vault, VaultItem } from "@/types";

/**
 * Presentation-layer classification of vault items into identity
 * categories. Purely derived (domain → name → owning vault), so it works
 * with any backend data without schema changes.
 */

export type IdentityCategory =
  | "gaming"
  | "finance"
  | "work"
  | "personal"
  | "social"
  | "development"
  | "streaming"
  | "shopping";

export const CATEGORY_META: Record<
  IdentityCategory,
  { label: string; color: string }
> = {
  personal: { label: "Personal", color: "#818cf8" },
  work: { label: "Work", color: "#60a5fa" },
  development: { label: "Development", color: "#22d3ee" },
  finance: { label: "Finance", color: "#34d399" },
  social: { label: "Social", color: "#fbbf24" },
  streaming: { label: "Streaming", color: "#fb7185" },
  gaming: { label: "Gaming", color: "#a78bfa" },
  shopping: { label: "Shopping", color: "#fb923c" },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_META) as IdentityCategory[];

/** Order matters — earlier patterns win (e.g. "aws" before "amazon."). */
const PATTERNS: Array<[RegExp, IdentityCategory]> = [
  [/github|gitlab|vercel|aws\b|amazonaws|digitalocean|cloudflare|npm|docker|postgres|ssh/, "development"],
  [/netflix|spotify|youtube|hulu|primevideo|twitch/, "streaming"],
  [/steam|epicgames|epic games|riotgames|battle\.net|playstation|xbox|nintendo/, "gaming"],
  [/paypal|stripe|hdfc|visa|mastercard|bank|wise|razorpay/, "finance"],
  [/slack|notion|figma|linear\b|jira|atlassian|adobe|zoom|linkedin/, "work"],
  [/twitter|x\.com|instagram|facebook|reddit|discord|mastodon/, "social"],
  [/amazon\.|flipkart|ebay|myntra|etsy|shopify/, "shopping"],
  [/google|apple|microsoft|proton|icloud/, "personal"],
];

const VAULT_FALLBACK: Array<[RegExp, IdentityCategory]> = [
  [/work|team|company/, "work"],
  [/finance|bank|money/, "finance"],
  [/infra|dev|server|engineering/, "development"],
];

export function domainOf(item: VaultItem): string | null {
  if (!item.url) return null;
  try {
    return new URL(item.url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function classifyItem(
  item: VaultItem,
  vaults: Vault[],
): IdentityCategory {
  const haystack = `${domainOf(item) ?? ""} ${item.name}`.toLowerCase();
  for (const [pattern, category] of PATTERNS) {
    if (pattern.test(haystack)) return category;
  }
  const vaultName =
    vaults.find((vault) => vault.id === item.vaultId)?.name.toLowerCase() ?? "";
  for (const [pattern, category] of VAULT_FALLBACK) {
    if (pattern.test(vaultName)) return category;
  }
  return "personal";
}
