import { initialAppState } from "./initialData";
import { AppState } from "./types";

const LOCAL_STORAGE_KEY = "sara_reports_state_v1";
const AUTH_TOKEN_KEY = "sara_reports_auth_token_v1";

export function loadLocalState(): AppState {
  if (typeof window === "undefined") {
    return initialAppState;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return initialAppState;
    const parsed = JSON.parse(raw);
    return {
      ...initialAppState,
      ...parsed,
      settings: {
        ...initialAppState.settings,
        ...(parsed.settings || {}),
        emailSettings: {
          ...initialAppState.settings.emailSettings,
          ...(parsed.settings?.emailSettings || {}),
        },
      },
    };
  } catch (e) {
    console.error("Failed to load local state:", e);
    return initialAppState;
  }
}

export function saveLocalState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save local state:", e);
  }
}

export async function fetchServerState(): Promise<AppState | null> {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.state) {
      saveLocalState(data.state);
      return data.state;
    }
  } catch (e) {
    console.warn("Could not sync with server, using local data:", e);
  }
  return null;
}

export async function syncStateToServer(state: AppState): Promise<boolean> {
  saveLocalState(state);
  try {
    const res = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    return res.ok;
  } catch (e) {
    console.warn("Server sync failed (offline or network error):", e);
    return false;
  }
}

// 30-day session token helper
export function checkAuthSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!raw) return false;
    const token = JSON.parse(raw);
    if (!token.expiresAt || new Date().getTime() > token.expiresAt) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function saveAuthSession(): void {
  if (typeof window === "undefined") return;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const token = {
    authenticated: true,
    expiresAt: new Date().getTime() + thirtyDaysMs,
  };
  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
