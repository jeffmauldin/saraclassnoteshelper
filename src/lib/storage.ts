import { getInitialStateForClassroom, initialAppState } from "./initialData";
import { AppState, AuthSession, ClassroomId, UserRole } from "./types";

const ACTIVE_CLASSROOM_KEY = "classnotes_active_classroom_v1";
const AUTH_TOKEN_KEY = "classnotes_auth_session_v2";
const LEGACY_AUTH_TOKEN_KEY = "sara_reports_auth_token_v1";
const LEGACY_SARA_STATE_KEY = "sara_reports_state_v1";

export function getActiveClassroomId(): ClassroomId {
  if (typeof window === "undefined") return "sara";
  try {
    const active = localStorage.getItem(ACTIVE_CLASSROOM_KEY);
    if (active === "megan") return "megan";
    return "sara";
  } catch {
    return "sara";
  }
}

export function setActiveClassroomId(id: ClassroomId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_CLASSROOM_KEY, id);
  } catch (e) {
    console.error("Failed to set active classroom:", e);
  }
}

function getClassroomStateKey(classroomId: ClassroomId): string {
  return `classnotes_state_${classroomId}_v1`;
}

export function loadLocalState(classroomId?: ClassroomId): AppState {
  const cid: ClassroomId = classroomId || getActiveClassroomId();
  const baseInitial = getInitialStateForClassroom(cid);

  if (typeof window === "undefined") {
    return baseInitial;
  }
  try {
    let raw = localStorage.getItem(getClassroomStateKey(cid));
    // Migration fallback for Sara
    if (!raw && cid === "sara") {
      raw = localStorage.getItem(LEGACY_SARA_STATE_KEY);
    }

    if (!raw) return baseInitial;
    const parsed = JSON.parse(raw);
    return {
      ...baseInitial,
      ...parsed,
      classroomId: cid,
      settings: {
        ...baseInitial.settings,
        ...(parsed.settings || {}),
        emailSettings: {
          ...baseInitial.settings.emailSettings,
          ...(parsed.settings?.emailSettings || {}),
        },
      },
    };
  } catch (e) {
    console.error(`Failed to load local state for ${cid}:`, e);
    return baseInitial;
  }
}

export function saveLocalState(state: AppState, classroomId?: ClassroomId): void {
  if (typeof window === "undefined") return;
  const cid: ClassroomId = classroomId || state.classroomId || getActiveClassroomId();
  try {
    const toSave: AppState = {
      ...state,
      classroomId: cid,
      updatedAt: state.updatedAt || Date.now(),
    };
    localStorage.setItem(getClassroomStateKey(cid), JSON.stringify(toSave));
    if (cid === "sara") {
      localStorage.setItem(LEGACY_SARA_STATE_KEY, JSON.stringify(toSave));
    }
  } catch (e) {
    console.error(`Failed to save local state for ${cid}:`, e);
  }
}

export async function fetchServerState(classroomId?: ClassroomId): Promise<AppState | null> {
  const cid: ClassroomId = classroomId || getActiveClassroomId();
  try {
    const res = await fetch(`/api/data?classroom=${cid}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();

    const localState = loadLocalState(cid);

    // If server has never saved data for this classroom (hasSavedState: false),
    // NEVER overwrite local state! Instead, seed the server with our local data.
    if (!data || !data.hasSavedState || !data.state) {
      if (localState) {
        syncStateToServer(localState, cid);
      }
      return localState;
    }

    const serverState = data.state as AppState;
    const serverTime = serverState.updatedAt || 0;
    const localTime = localState.updatedAt || 0;

    // Check if local state has actual user edits (notes or non-default selections)
    const localHasEdits = Object.values(localState.entries || {}).some(
      (e) => (e.notes1 && e.notes1.trim().length > 0) || (e.notes2 && e.notes2.trim().length > 0)
    );
    const serverHasEdits = Object.values(serverState.entries || {}).some(
      (e) => (e.notes1 && e.notes1.trim().length > 0) || (e.notes2 && e.notes2.trim().length > 0)
    );

    // Conflict resolution:
    // 1. If server timestamp is strictly newer, server wins
    if (serverTime > localTime) {
      saveLocalState(serverState, cid);
      return serverState;
    }

    // 2. If timestamps are equal (or both 0), but local has edits and server is empty, local wins
    if (serverTime === localTime && localHasEdits && !serverHasEdits) {
      syncStateToServer(localState, cid);
      return localState;
    }

    // 3. If local timestamp is newer, local wins and updates server
    if (localTime > serverTime) {
      syncStateToServer(localState, cid);
      return localState;
    }

    // Default: accept server state
    saveLocalState(serverState, cid);
    return serverState;
  } catch (e) {
    console.warn(`Could not sync with server for ${cid}, using local data:`, e);
  }
  return null;
}

export async function syncStateToServer(state: AppState, classroomId?: ClassroomId): Promise<boolean> {
  const cid: ClassroomId = classroomId || state.classroomId || getActiveClassroomId();
  const toSync: AppState = {
    ...state,
    classroomId: cid,
    updatedAt: state.updatedAt || Date.now(),
  };
  saveLocalState(toSync, cid);
  try {
    const res = await fetch(`/api/data?classroom=${cid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: toSync }),
    });
    return res.ok;
  } catch (e) {
    console.warn(`Server sync failed for ${cid} (offline or network error):`, e);
    return false;
  }
}

// 30-day session token helpers
export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_TOKEN_KEY);
    if (raw) {
      const session: AuthSession = JSON.parse(raw);
      if (session.expiresAt && new Date().getTime() <= session.expiresAt) {
        return session;
      }
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    // Check legacy token
    const legacyRaw = localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy.expiresAt && new Date().getTime() <= legacy.expiresAt) {
        // Upgrade legacy token to sara teacher role
        const upgraded: AuthSession = {
          authenticated: true,
          role: "teacher",
          classroomId: "sara",
          expiresAt: legacy.expiresAt,
        };
        saveAuthSession(upgraded.role, upgraded.classroomId);
        return upgraded;
      }
      localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
    }

    return null;
  } catch {
    return null;
  }
}

export function checkAuthSession(): boolean {
  return Boolean(getAuthSession()?.authenticated);
}

export function saveAuthSession(
  role: UserRole = "teacher",
  classroomId: ClassroomId | "all" = "sara"
): void {
  if (typeof window === "undefined") return;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const session: AuthSession = {
    authenticated: true,
    role,
    classroomId,
    expiresAt: new Date().getTime() + thirtyDaysMs,
  };
  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(session));
  if (classroomId !== "all") {
    setActiveClassroomId(classroomId);
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
}

