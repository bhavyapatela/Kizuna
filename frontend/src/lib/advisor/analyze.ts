import { differenceInDays, format, subDays, subHours } from "date-fns";
import { estimateStrength } from "@/lib/password";
import { classifyItem, CATEGORY_META } from "@/lib/identity/classify";
import type {
  AdvisorRecommendation,
  AdvisorStats,
  AdvisorTrendPoint,
  Vault,
  VaultItem,
} from "@/types";

/**
 * Local, rule-based vault analyzer.
 *
 * ARCHITECTURE NOTE: this module is the stand-in for the future
 * FastAPI + LLM advisor. The service layer calls `analyzeVault()` today;
 * once the backend exists it calls GET /advisor/recommendations instead
 * and this file can be deleted. Recommendation IDs are deterministic
 * (rule + subject) so statuses persist across re-analysis — the backend
 * should keep that contract.
 */

const WEAK_THRESHOLD = 50;
const STALE_DAYS = 150;

function scoreOf(item: VaultItem): number | null {
  return item.password ? estimateStrength(item.password).score : null;
}

export function analyzeVault(
  items: VaultItem[],
  vaults: Vault[],
  now: Date,
): AdvisorRecommendation[] {
  const recommendations: AdvisorRecommendation[] = [];
  const vaultName = (id: string) =>
    vaults.find((vault) => vault.id === id)?.name ?? "your vault";

  const scored = items
    .map((item) => ({ item, score: scoreOf(item) }))
    .filter((entry): entry is { item: VaultItem; score: number } =>
      entry.score !== null,
    );
  const averageScore =
    scored.reduce((sum, entry) => sum + entry.score, 0) /
    Math.max(scored.length, 1);

  // --- Rule: reused passwords (critical) ---------------------------
  const byPassword = new Map<string, VaultItem[]>();
  for (const item of items) {
    if (!item.password) continue;
    byPassword.set(item.password, [
      ...(byPassword.get(item.password) ?? []),
      item,
    ]);
  }
  for (const group of byPassword.values()) {
    if (group.length < 2) continue;
    const names = group.map((item) => item.name);
    const anchor = group[0];
    recommendations.push({
      id: `reuse-${group.map((item) => item.id).sort().join("-")}`,
      severity: "critical",
      category: "reuse",
      title: `The same password protects ${names.join(" and ")}`,
      description: `You reuse one password across ${group.length} accounts. If any one of them is breached, every account in this group is exposed at once.`,
      action: `Generate a unique password for ${names.slice(1).join(" and ")} — keep each account isolated.`,
      impact: 8 + group.length * 3,
      status: "active",
      createdAt: subHours(now, 3).toISOString(),
      relatedItemIds: group.map((item) => item.id),
      reviewHref: `/vaults/${anchor.vaultId}`,
    });
  }

  // --- Rule: significantly weaker than average (critical) ----------
  for (const { item, score } of scored) {
    if (score < WEAK_THRESHOLD && score < averageScore - 20) {
      recommendations.push({
        id: `weak-${item.id}`,
        severity: "critical",
        category: "passwords",
        title: `Your ${item.name} password is significantly weaker than your average`,
        description: `This password scores ${score}/100 against a vault average of ${Math.round(averageScore)}. Short, common patterns like this are the first thing credential-stuffing bots try.`,
        action: "Replace it with a generated 20+ character password.",
        impact: 10,
        status: "active",
        createdAt: subHours(now, 5).toISOString(),
        relatedItemIds: [item.id],
        reviewHref: `/vaults/${item.vaultId}`,
      });
    }
  }

  // --- Rule: stale passwords (warning) -----------------------------
  const stale = items
    .filter(
      (item) =>
        item.password &&
        differenceInDays(now, new Date(item.updatedAt)) > STALE_DAYS,
    )
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
    .slice(0, 2);
  for (const item of stale) {
    const days = differenceInDays(now, new Date(item.updatedAt));
    recommendations.push({
      id: `stale-${item.id}`,
      severity: "warning",
      category: "passwords",
      title: `Your ${item.name} password hasn't changed since ${format(new Date(item.updatedAt), "MMMM yyyy")}`,
      description: `It has been ${days} days since this password was last rotated. Long-lived credentials accumulate exposure with every breach that happens around them.`,
      action: "Rotate it with a freshly generated password.",
      impact: 6,
      status: "active",
      createdAt: subHours(now, 8).toISOString(),
      relatedItemIds: [item.id],
      reviewHref: `/vaults/${item.vaultId}`,
    });
  }

  // --- Rule: MFA on the hub account (warning) ----------------------
  const emailCounts = new Map<string, number>();
  for (const item of items) {
    if (item.username?.includes("@")) {
      const email = item.username.toLowerCase();
      emailCounts.set(email, (emailCounts.get(email) ?? 0) + 1);
    }
  }
  const hub = [...emailCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (hub && hub[1] >= 5) {
    recommendations.push({
      id: `mfa-${hub[0]}`,
      severity: "warning",
      category: "authentication",
      title: `${hub[0]} protects ${hub[1]} connected services`,
      description: `This email is the recovery path for ${hub[1]} accounts. Anyone who controls it can reset most of your digital life — it deserves the strongest protection you have.`,
      action: "Enable multi-factor authentication on this account.",
      impact: 14,
      status: "active",
      createdAt: subHours(now, 12).toISOString(),
      reviewHref: "/identity",
    });
  }

  // --- Rule: finance passwords should be longer (suggestion) -------
  const shortFinance = items.filter(
    (item) =>
      classifyItem(item, vaults) === "finance" &&
      item.password &&
      item.password.length < 24,
  );
  if (shortFinance.length > 0) {
    recommendations.push({
      id: "finance-length",
      severity: "suggestion",
      category: "passwords",
      title: `${shortFinance.length} finance ${shortFinance.length === 1 ? "account uses" : "accounts use"} passwords under 24 characters`,
      description: `${shortFinance.map((item) => item.name).join(", ")} — money accounts justify maximum-length passwords, since you never type them by hand anyway.`,
      action: "Regenerate these with 24+ character passwords.",
      impact: 5,
      status: "active",
      createdAt: subHours(now, 20).toISOString(),
      relatedItemIds: shortFinance.map((item) => item.id),
      reviewHref: `/vaults/${shortFinance[0].vaultId}`,
    });
  }

  // --- Rule: misfiled items (suggestion) ---------------------------
  const misfiled = items.find((item) => {
    const category = classifyItem(item, vaults);
    const home = vaultName(item.vaultId).toLowerCase();
    return category === "development" && !/infra|dev|engineering/.test(home);
  });
  if (misfiled) {
    const target = vaults.find((vault) => /infra|dev/i.test(vault.name));
    if (target) {
      recommendations.push({
        id: `move-${misfiled.id}`,
        severity: "suggestion",
        category: "organization",
        title: `Consider moving ${misfiled.name} into your ${target.name} vault`,
        description: `${misfiled.name} looks like a ${CATEGORY_META.development.label.toLowerCase()} credential living in your ${vaultName(misfiled.vaultId)} vault. Grouping it with your other infrastructure logins keeps access patterns clean.`,
        action: `Move it to the ${target.name} vault.`,
        impact: 2,
        status: "active",
        createdAt: subDays(now, 1).toISOString(),
        relatedItemIds: [misfiled.id],
        reviewHref: `/vaults/${misfiled.vaultId}`,
      });
    }
  }

  // --- Rule: missing recovery notes (suggestion) -------------------
  const noNotes = items.filter(
    (item) => item.type === "login" && !item.notes,
  );
  if (noNotes.length >= 3) {
    recommendations.push({
      id: "recovery-notes",
      severity: "suggestion",
      category: "hygiene",
      title: `${noNotes.length} accounts still don't have recovery notes`,
      description:
        "Recovery codes, backup emails, and security questions are what get you back in when a login breaks. Right now most of your accounts have nothing on file.",
      action: "Add recovery notes to your most important accounts first.",
      impact: 4,
      status: "active",
      createdAt: subDays(now, 1).toISOString(),
      reviewHref: "/vaults",
    });
  }

  // --- Rule: master password reminder (suggestion) -----------------
  recommendations.push({
    id: "master-password",
    severity: "suggestion",
    category: "authentication",
    title: "You haven't updated your master password recently",
    description:
      "Your master password is the single key to everything here. Rotating it once or twice a year — and never using it anywhere else — keeps that key trustworthy.",
    action: "Schedule a master password change in Settings.",
    impact: 6,
    status: "active",
    createdAt: subDays(now, 2).toISOString(),
    reviewHref: "/settings",
  });

  // --- Rule: strongest vault (success) -----------------------------
  const vaultScores = vaults
    .map((vault) => {
      const scores = scored.filter((entry) => entry.item.vaultId === vault.id);
      if (scores.length === 0) return null;
      return {
        vault,
        average:
          scores.reduce((sum, entry) => sum + entry.score, 0) / scores.length,
      };
    })
    .filter((entry): entry is { vault: Vault; average: number } => !!entry)
    .sort((a, b) => b.average - a.average);
  if (vaultScores.length > 0) {
    const best = vaultScores[0];
    recommendations.push({
      id: `strongest-${best.vault.id}`,
      severity: "success",
      category: "achievement",
      title: `Your ${best.vault.name} vault has the strongest overall security`,
      description: `Every password in ${best.vault.name} averages ${Math.round(best.average)}/100 — this is the bar the rest of your vaults should meet.`,
      action: "Keep it up — nothing to fix here.",
      impact: 0,
      status: "active",
      createdAt: subDays(now, 2).toISOString(),
      reviewHref: `/vaults/${best.vault.id}`,
    });
  }

  return recommendations;
}

// ---------------------------------------------------------------------

export function computeAdvisorStats(
  items: VaultItem[],
  completed: AdvisorRecommendation[],
  trendSeed: AdvisorTrendPoint[],
  now: Date,
): AdvisorStats {
  const withPasswords = items.filter((item) => item.password);

  const reusedGroups = new Map<string, number>();
  for (const item of withPasswords) {
    reusedGroups.set(
      item.password!,
      (reusedGroups.get(item.password!) ?? 0) + 1,
    );
  }
  const reusedPasswords = [...reusedGroups.values()]
    .filter((count) => count > 1)
    .reduce((sum, count) => sum + count, 0);

  const weakPasswords = withPasswords.filter(
    (item) => estimateStrength(item.password!).score < WEAK_THRESHOLD,
  ).length;

  const averagePasswordAgeDays = Math.round(
    withPasswords.reduce(
      (sum, item) => sum + differenceInDays(now, new Date(item.updatedAt)),
      0,
    ) / Math.max(withPasswords.length, 1),
  );

  const scores = withPasswords.map(
    (item) => estimateStrength(item.password!).score,
  );
  const averageStrength =
    scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1);
  const penalty =
    (weakPasswords / Math.max(withPasswords.length, 1)) * 30 +
    (reusedPasswords / Math.max(withPasswords.length, 1)) * 25;
  const currentScore = Math.max(
    0,
    Math.round(averageStrength - penalty),
  );

  return {
    resolvedCount: completed.length,
    improvementPoints: completed.reduce(
      (sum, recommendation) => sum + recommendation.impact,
      0,
    ),
    averagePasswordAgeDays,
    reusedPasswords,
    weakPasswords,
    currentScore,
    trend: [...trendSeed, { label: "Now", score: currentScore }],
  };
}
