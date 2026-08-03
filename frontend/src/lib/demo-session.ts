/**
 * TEMPORARY DEMO AUTHENTICATION
 * -----------------------------
 * Frontend-only session used while the FastAPI backend is not implemented.
 * The entire demo flow lives in this module plus the `hasBackend()` branches
 * in `services/auth.ts` — once real auth exists (httpOnly session cookies
 * issued by POST /auth/login), delete this file and remove those branches.
 * Nothing else in the app knows the session is fake.
 */

export const DEMO_CREDENTIALS = {
  email: "demo@kizuna.app",
  password: "Kizuna@2026",
} as const;

const STORAGE_KEY = "kizuna.demo-session";
const SESSION_EVENT = "kizuna:demo-session-change";

function notify(): void {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function isDemoSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "active";
  } catch {
    return false;
  }
}

export function startDemoSession(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "active");
  } catch {
    // Storage unavailable (private mode) — session lasts for the page life.
  }
  notify();
}

export function endDemoSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — nothing to clear.
  }
  notify();
}

/** Subscribe to session changes (this tab + other tabs). */
export function subscribeToDemoSession(callback: () => void): () => void {
  window.addEventListener(SESSION_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SESSION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
