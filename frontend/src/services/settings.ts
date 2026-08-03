import { apiFetch, hasBackend } from "@/lib/api-client";
import { DEMO_SETTINGS, delay } from "@/lib/demo-db";
import type { UpdateSettingsPayload, UserSettings } from "@/types";

let demoSettings: UserSettings = { ...DEMO_SETTINGS };

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    if (!hasBackend()) {
      await delay(200);
      return demoSettings;
    }
    return apiFetch<UserSettings>("/settings");
  },

  async updateSettings(payload: UpdateSettingsPayload): Promise<UserSettings> {
    if (!hasBackend()) {
      await delay(400);
      demoSettings = { ...demoSettings, ...payload };
      return demoSettings;
    }
    return apiFetch<UserSettings>("/settings", {
      method: "PUT",
      body: payload,
    });
  },
};
