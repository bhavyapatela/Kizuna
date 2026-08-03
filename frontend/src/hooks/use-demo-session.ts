"use client";

import { useSyncExternalStore } from "react";
import {
  isDemoSessionActive,
  subscribeToDemoSession,
} from "@/lib/demo-session";

/**
 * TEMPORARY: reactive view of the demo session (lib/demo-session.ts).
 * Replace with a real session query (GET /auth/me) once FastAPI auth lands.
 * Returns false during SSR, then the real value on the client.
 */
export function useDemoSession(): boolean {
  return useSyncExternalStore(
    subscribeToDemoSession,
    isDemoSessionActive,
    () => false,
  );
}
