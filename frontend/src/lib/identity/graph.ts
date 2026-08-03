import { differenceInDays } from "date-fns";
import { estimateStrength } from "@/lib/password";
import {
  CATEGORY_META,
  classifyItem,
  domainOf,
  type IdentityCategory,
} from "./classify";
import type { Vault, VaultItem } from "@/types";

/**
 * Pure graph model for the Digital Identity Map.
 *
 * FUTURE (AI features): this module is the single extension point.
 * A model can annotate nodes via `flags` (risk propagation, compromised
 * services, duplicate identities, suspicious relationships) and the
 * renderer already colors/rings nodes by flag — no renderer changes
 * needed. Cluster assignment lives in `groupKey`, so alternative
 * AI-driven clusterings just supply a different grouping function.
 */

export type RelationMode =
  | "vault"
  | "email"
  | "category"
  | "strength"
  | "updated"
  | "provider";

export const RELATION_MODES: Array<{ value: RelationMode; label: string }> = [
  { value: "category", label: "Category" },
  { value: "vault", label: "Vault" },
  { value: "email", label: "Email" },
  { value: "provider", label: "Provider" },
  { value: "strength", label: "Password strength" },
  { value: "updated", label: "Last updated" },
];

/** Extensible node annotations — populated today by static analysis,
 *  tomorrow by AI (e.g. "compromised", "duplicate", "suspicious"). */
export type NodeFlag = "weak" | "reused";

export interface IdentityNode {
  id: string;
  kind: "user" | "service";
  label: string;
  item?: VaultItem;
  vaultName?: string;
  domain: string | null;
  category: IdentityCategory | null;
  groupKey: string;
  groupLabel: string;
  color: string;
  radius: number;
  strength: number | null;
  flags: NodeFlag[];
  /** Cluster anchor the simulation drifts this node toward. */
  tx: number;
  ty: number;
  // d3-force mutates these:
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface IdentityEdge {
  source: string | IdentityNode;
  target: string | IdentityNode;
  kind: "backbone" | "relation";
  color: string;
}

export interface IdentityGraphModel {
  nodes: IdentityNode[];
  edges: IdentityEdge[];
  groups: Array<{ key: string; label: string; color: string; count: number }>;
}

const GROUP_PALETTE = [
  "#60a5fa",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#fb7185",
  "#22d3ee",
  "#fb923c",
  "#818cf8",
];

const USER_RADIUS = 30;
const CLUSTER_RADIUS = 300;

function strengthBucket(item: VaultItem): string {
  if (!item.password) return "No password";
  const score = estimateStrength(item.password).score;
  if (score >= 80) return "Strong";
  if (score >= 55) return "Good";
  if (score >= 30) return "Fair";
  return "Weak";
}

function updatedBucket(item: VaultItem, now: Date): string {
  const days = differenceInDays(now, new Date(item.updatedAt));
  if (days <= 7) return "This week";
  if (days <= 30) return "This month";
  if (days <= 90) return "This quarter";
  return "Older";
}

function providerOf(item: VaultItem): string {
  const username = item.username ?? "";
  const at = username.indexOf("@");
  return at > 0 ? username.slice(at + 1).toLowerCase() : "No email";
}

function groupKeyFor(
  item: VaultItem,
  mode: RelationMode,
  category: IdentityCategory,
  vaultName: string,
  now: Date,
): { key: string; label: string } {
  switch (mode) {
    case "vault":
      return { key: item.vaultId, label: vaultName };
    case "email": {
      const email = item.username?.toLowerCase() ?? `solo:${item.id}`;
      return { key: email, label: item.username ?? "No username" };
    }
    case "provider": {
      const provider = providerOf(item);
      return { key: provider, label: provider };
    }
    case "strength": {
      const bucket = strengthBucket(item);
      return { key: bucket, label: bucket };
    }
    case "updated": {
      const bucket = updatedBucket(item, now);
      return { key: bucket, label: bucket };
    }
    case "category":
    default:
      return { key: category, label: CATEGORY_META[category].label };
  }
}

export function buildIdentityGraph(options: {
  items: VaultItem[];
  vaults: Vault[];
  mode: RelationMode;
  categories: Set<IdentityCategory>;
}): IdentityGraphModel {
  const { items, vaults, mode, categories } = options;
  const now = new Date();

  // Reuse detection runs across ALL items so filtering never hides risk.
  const passwordCounts = new Map<string, number>();
  for (const item of items) {
    if (item.password) {
      passwordCounts.set(
        item.password,
        (passwordCounts.get(item.password) ?? 0) + 1,
      );
    }
  }

  const user: IdentityNode = {
    id: "user",
    kind: "user",
    label: "You",
    domain: null,
    category: null,
    groupKey: "user",
    groupLabel: "You",
    color: "#3b82f6",
    radius: USER_RADIUS,
    strength: null,
    flags: [],
    tx: 0,
    ty: 0,
    fx: 0,
    fy: 0,
  };

  const nodes: IdentityNode[] = [user];
  const groupOrder: string[] = [];
  const groupInfo = new Map<
    string,
    { label: string; color: string; members: IdentityNode[] }
  >();

  for (const item of items) {
    const category = classifyItem(item, vaults);
    if (!categories.has(category)) continue;

    const vaultName =
      vaults.find((vault) => vault.id === item.vaultId)?.name ?? "Vault";
    const group = groupKeyFor(item, mode, category, vaultName, now);

    if (!groupInfo.has(group.key)) {
      const color =
        mode === "category"
          ? CATEGORY_META[category].color
          : GROUP_PALETTE[groupOrder.length % GROUP_PALETTE.length];
      groupInfo.set(group.key, { label: group.label, color, members: [] });
      groupOrder.push(group.key);
    }
    const info = groupInfo.get(group.key)!;

    const strength = item.password
      ? estimateStrength(item.password).score
      : null;
    const flags: NodeFlag[] = [];
    if (strength !== null && strength < 40) flags.push("weak");
    if (item.password && (passwordCounts.get(item.password) ?? 0) > 1) {
      flags.push("reused");
    }

    const node: IdentityNode = {
      id: item.id,
      kind: "service",
      label: item.name,
      item,
      vaultName,
      domain: domainOf(item),
      category,
      groupKey: group.key,
      groupLabel: group.label,
      color: CATEGORY_META[category].color,
      radius: item.favorite ? 17 : 14,
      strength,
      flags,
      tx: 0,
      ty: 0,
    };
    nodes.push(node);
    info.members.push(node);
  }

  // Spread groups around the user and give members cluster anchors.
  groupOrder.forEach((key, index) => {
    const info = groupInfo.get(key)!;
    const angle = (index / Math.max(groupOrder.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const radius = CLUSTER_RADIUS * (info.members.length > 3 ? 1 : 0.82);
    for (const member of info.members) {
      member.tx = Math.cos(angle) * radius;
      member.ty = Math.sin(angle) * radius;
    }
  });

  // Backbone: every service ties back to the user (the identity itself).
  const edges: IdentityEdge[] = nodes
    .filter((node) => node.kind === "service")
    .map((node) => ({
      source: "user",
      target: node.id,
      kind: "backbone" as const,
      color: "#94a3b8",
    }));

  // Relation edges: star from each group's hub (most recently updated
  // member) — k-1 edges per group keeps hundreds of nodes readable.
  for (const key of groupOrder) {
    const info = groupInfo.get(key)!;
    if (info.members.length < 2) continue;
    const [hub, ...rest] = [...info.members].sort((a, b) =>
      (b.item?.updatedAt ?? "").localeCompare(a.item?.updatedAt ?? ""),
    );
    for (const member of rest) {
      edges.push({
        source: hub.id,
        target: member.id,
        kind: "relation",
        color: info.color,
      });
    }
  }

  return {
    nodes,
    edges,
    groups: groupOrder.map((key) => {
      const info = groupInfo.get(key)!;
      return {
        key,
        label: info.label,
        color: info.color,
        count: info.members.length,
      };
    }),
  };
}

// ---------------------------------------------------------------------
// Insights

export interface IdentityInsight {
  id: string;
  label: string;
  value: string;
  hint?: string;
  /** 0-100 when the insight is a meter (e.g. average strength). */
  meter?: number;
  tone?: "default" | "warning";
}

export function computeInsights(
  items: VaultItem[],
  vaults: Vault[],
): IdentityInsight[] {
  if (items.length === 0) return [];
  const insights: IdentityInsight[] = [];

  const emailCounts = new Map<string, number>();
  for (const item of items) {
    if (item.username?.includes("@")) {
      const email = item.username.toLowerCase();
      emailCounts.set(email, (emailCounts.get(email) ?? 0) + 1);
    }
  }
  const topEmail = [...emailCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topEmail) {
    insights.push({
      id: "email",
      label: "Most connected email",
      value: topEmail[0],
      hint: `${topEmail[1]} accounts`,
    });
  }

  const largestVault = [...vaults].sort((a, b) => b.itemCount - a.itemCount)[0];
  if (largestVault) {
    insights.push({
      id: "vault",
      label: "Largest vault",
      value: largestVault.name,
      hint: `${largestVault.itemCount} items`,
    });
  }

  const byCategory = new Map<IdentityCategory, { total: number; scored: number[] }>();
  for (const item of items) {
    const category = classifyItem(item, vaults);
    const entry = byCategory.get(category) ?? { total: 0, scored: [] };
    entry.total += 1;
    if (item.password) entry.scored.push(estimateStrength(item.password).score);
    byCategory.set(category, entry);
  }

  const weakest = [...byCategory.entries()]
    .filter(([, entry]) => entry.scored.length > 0)
    .map(([category, entry]) => ({
      category,
      average:
        entry.scored.reduce((sum, score) => sum + score, 0) /
        entry.scored.length,
    }))
    .sort((a, b) => a.average - b.average)[0];
  if (weakest) {
    insights.push({
      id: "weakest",
      label: "Weakest identity cluster",
      value: CATEGORY_META[weakest.category].label,
      hint: `avg strength ${Math.round(weakest.average)}`,
      tone: "warning",
    });
  }

  const oldest = [...items].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  )[0];
  insights.push({
    id: "oldest",
    label: "Oldest account",
    value: oldest.name,
    hint: `since ${new Date(oldest.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}`,
  });

  const providerCounts = new Map<string, number>();
  for (const item of items) {
    const provider = providerOf(item);
    if (provider !== "No email") {
      providerCounts.set(provider, (providerCounts.get(provider) ?? 0) + 1);
    }
  }
  const topProvider = [...providerCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];
  if (topProvider) {
    insights.push({
      id: "provider",
      label: "Most used provider",
      value: topProvider[0],
      hint: `${topProvider[1]} accounts`,
    });
  }

  const largestCategory = [...byCategory.entries()].sort(
    (a, b) => b[1].total - a[1].total,
  )[0];
  if (largestCategory) {
    insights.push({
      id: "category",
      label: "Largest category",
      value: CATEGORY_META[largestCategory[0]].label,
      hint: `${largestCategory[1].total} identities`,
    });
  }

  const allScores = items
    .filter((item) => item.password)
    .map((item) => estimateStrength(item.password!).score);
  if (allScores.length > 0) {
    const average = Math.round(
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length,
    );
    insights.push({
      id: "strength",
      label: "Average password strength",
      value: `${average} / 100`,
      meter: average,
      tone: average < 55 ? "warning" : "default",
    });
  }

  return insights;
}
