import { apiFetch, hasBackend } from "@/lib/api-client";
import { DEMO_USER, delay } from "@/lib/demo-db";
import {
  DEMO_CREDENTIALS,
  endDemoSession,
  startDemoSession,
} from "@/lib/demo-session";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types";

/**
 * Auth service. Every `!hasBackend()` branch is TEMPORARY demo logic
 * (see lib/demo-session.ts) — the `apiFetch` calls below each branch are
 * the real FastAPI integration points and stay unchanged.
 */
export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (!hasBackend()) {
      // DEMO ONLY: accept exactly the published demo credentials.
      await delay(700);
      if (
        payload.email !== DEMO_CREDENTIALS.email ||
        payload.password !== DEMO_CREDENTIALS.password
      ) {
        throw new Error(
          "Invalid credentials. Use the demo account shown below the form.",
        );
      }
      startDemoSession();
      return { user: DEMO_USER, accessToken: "demo-token" };
    }
    // REAL AUTH: FastAPI issues the session here.
    return apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (!hasBackend()) {
      // DEMO ONLY: any signup drops into the shared demo session.
      await delay(900);
      startDemoSession();
      return {
        user: { ...DEMO_USER, name: payload.name, email: payload.email },
        accessToken: "demo-token",
      };
    }
    // REAL AUTH: FastAPI creates the account here.
    return apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  async me(): Promise<User> {
    if (!hasBackend()) {
      await delay(200);
      return DEMO_USER;
    }
    // REAL AUTH: session introspection endpoint.
    return apiFetch<User>("/auth/me");
  },

  async logout(): Promise<void> {
    if (!hasBackend()) {
      // DEMO ONLY: clear the local demo session.
      await delay(300);
      endDemoSession();
      return;
    }
    // REAL AUTH: FastAPI invalidates the session here.
    return apiFetch<void>("/auth/logout", { method: "POST" });
  },
};
