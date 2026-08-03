export const APP_NAME = "Kizuna";
export const APP_DESCRIPTION =
  "A personal password manager built on trust, privacy, and speed.";

/**
 * Base URL for the FastAPI backend. When undefined the service layer
 * transparently falls back to the in-memory demo adapter so the UI stays
 * fully navigable without a running backend.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const CLIPBOARD_CLEAR_SECONDS = 30;
