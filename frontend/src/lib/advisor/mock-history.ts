import { subDays } from "date-fns";
import type { AdvisorRecommendation, AdvisorTrendPoint } from "@/types";

/**
 * TEMPORARY seed data for the advisor timeline and trend chart —
 * improvements the user "already made" before today. Replaced by
 * GET /advisor/history once the FastAPI backend exists.
 */

export function seedHistory(now: Date): AdvisorRecommendation[] {
  return [
    {
      id: "hist-slack-rotation",
      severity: "warning",
      category: "passwords",
      title: "Rotated your Slack password",
      description: "Replaced a 14-month-old password with a generated one.",
      action: "Rotate the stale password.",
      impact: 6,
      status: "completed",
      createdAt: subDays(now, 21).toISOString(),
      resolvedAt: subDays(now, 19).toISOString(),
      reviewHref: "/vaults/vault_work",
    },
    {
      id: "hist-autolock",
      severity: "suggestion",
      category: "hygiene",
      title: "Enabled 10-minute auto-lock",
      description: "Your vault now locks itself when you step away.",
      action: "Enable auto-lock in Settings.",
      impact: 5,
      status: "completed",
      createdAt: subDays(now, 14).toISOString(),
      resolvedAt: subDays(now, 14).toISOString(),
      reviewHref: "/settings",
    },
    {
      id: "hist-visa-move",
      severity: "suggestion",
      category: "organization",
      title: "Moved Visa Platinum into the Finance vault",
      description: "Payment credentials now live with the rest of your finance identity.",
      action: "Move the card to Finance.",
      impact: 2,
      status: "completed",
      createdAt: subDays(now, 9).toISOString(),
      resolvedAt: subDays(now, 8).toISOString(),
      reviewHref: "/vaults/vault_finance",
    },
    {
      id: "hist-aws-strong",
      severity: "critical",
      category: "passwords",
      title: "Replaced a weak AWS Console password",
      description: "Your most sensitive infrastructure login now scores 96/100.",
      action: "Generate a strong replacement.",
      impact: 12,
      status: "completed",
      createdAt: subDays(now, 6).toISOString(),
      resolvedAt: subDays(now, 5).toISOString(),
      reviewHref: "/vaults/vault_dev",
    },
  ];
}

/** Weekly security score leading up to today's computed value. */
export function seedTrend(): AdvisorTrendPoint[] {
  return [
    { label: "6w ago", score: 48 },
    { label: "5w ago", score: 52 },
    { label: "4w ago", score: 51 },
    { label: "3w ago", score: 58 },
    { label: "2w ago", score: 63 },
    { label: "1w ago", score: 67 },
  ];
}
