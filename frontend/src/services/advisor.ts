import { apiFetch, hasBackend } from "@/lib/api-client";
import { delay, demoDb } from "@/lib/demo-db";
import { analyzeVault, computeAdvisorStats } from "@/lib/advisor/analyze";
import { seedHistory, seedTrend } from "@/lib/advisor/mock-history";
import type {
  AdvisorRecommendation,
  AdvisorStats,
  AdvisorStatus,
} from "@/types";

/**
 * Advisor service. The `!hasBackend()` branches run the local rule-based
 * analyzer (lib/advisor) — the future FastAPI + LLM advisor replaces
 * them via the endpoints noted below without touching hooks or UI.
 */

/** Demo-only: status overrides keyed by deterministic recommendation id. */
const statusOverrides = new Map<
  string,
  { status: AdvisorStatus; resolvedAt?: string }
>();

function withOverrides(
  recommendations: AdvisorRecommendation[],
): AdvisorRecommendation[] {
  return recommendations.map((recommendation) => {
    const override = statusOverrides.get(recommendation.id);
    return override ? { ...recommendation, ...override } : recommendation;
  });
}

function demoRecommendations(): AdvisorRecommendation[] {
  const now = new Date();
  const live = analyzeVault(demoDb.getItems(), demoDb.getVaults(), now);
  return [...withOverrides(live), ...seedHistory(now)];
}

export const advisorService = {
  async getRecommendations(): Promise<AdvisorRecommendation[]> {
    if (!hasBackend()) {
      await delay(450);
      return demoRecommendations();
    }
    // REAL API: GET /advisor/recommendations
    return apiFetch<AdvisorRecommendation[]>("/advisor/recommendations");
  },

  async updateStatus(
    id: string,
    status: AdvisorStatus,
  ): Promise<AdvisorRecommendation | undefined> {
    if (!hasBackend()) {
      await delay(250);
      statusOverrides.set(id, {
        status,
        resolvedAt:
          status === "completed" ? new Date().toISOString() : undefined,
      });
      return demoRecommendations().find(
        (recommendation) => recommendation.id === id,
      );
    }
    // REAL API: PATCH /advisor/recommendations/:id
    return apiFetch<AdvisorRecommendation>(`/advisor/recommendations/${id}`, {
      method: "PATCH",
      body: { status },
    });
  },

  async getStats(): Promise<AdvisorStats> {
    if (!hasBackend()) {
      await delay(350);
      const now = new Date();
      const completed = demoRecommendations().filter(
        (recommendation) => recommendation.status === "completed",
      );
      return computeAdvisorStats(
        demoDb.getItems(),
        completed,
        seedTrend(),
        now,
      );
    }
    // REAL API: GET /advisor/stats
    return apiFetch<AdvisorStats>("/advisor/stats");
  },
};
