export type AdvisorSeverity = "critical" | "warning" | "suggestion" | "success";

export type AdvisorStatus = "active" | "ignored" | "completed";

export type AdvisorCategory =
  | "passwords"
  | "reuse"
  | "hygiene"
  | "organization"
  | "authentication"
  | "achievement";

export interface AdvisorRecommendation {
  id: string;
  severity: AdvisorSeverity;
  category: AdvisorCategory;
  title: string;
  description: string;
  /** Suggested action, phrased imperatively ("Rotate this password…"). */
  action: string;
  /** Estimated security impact in points when completed. */
  impact: number;
  status: AdvisorStatus;
  createdAt: string;
  resolvedAt?: string;
  /** Vault items this recommendation is about (deep links, future AI). */
  relatedItemIds?: string[];
  /** Where "Review" takes the user. */
  reviewHref: string;
}

export interface AdvisorTrendPoint {
  label: string;
  score: number;
}

export interface AdvisorStats {
  resolvedCount: number;
  improvementPoints: number;
  averagePasswordAgeDays: number;
  reusedPasswords: number;
  weakPasswords: number;
  currentScore: number;
  trend: AdvisorTrendPoint[];
}
