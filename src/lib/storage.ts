import { getInitialStateForClassroom, initialAppState } from "./initialData";
import { AppState, AuthSession, ClassroomId, UserRole } from "./types";

const ACTIVE_CLASSROOM_KEY = "classnotes_active_classroom_v1";
const AUTH_TOKEN_KEY = "classnotes_auth_session_v2";
const LEGACY_AUTH_TOKEN_KEY = "sara_reports_auth_token_v1";
const LEGACY_SARA_STATE_KEY = "sara_reports_state_v1";

// Memory storage fallback for SSR or testing environments where window is not defined
let memoryStore: Record<string, string> = {};

export function clearMemoryStorage(): void {
  memoryStore = {};
}

function getStorageItem(key: string): string | null {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryStore[key] || null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStore[key] = value;
}

function removeStorageItem(key: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
      return;
    }
  } catch {}
  delete memoryStore[key];
}

export function getActiveClassroomId(): ClassroomId {
  try {
    const active = getStorageItem(ACTIVE_CLASSROOM_KEY);
    if (active === "megan") return "megan";
    return "sara";
  } catch {
    return "sara";
  }
}

export function setActiveClassroomId(id: ClassroomId): void {
  try {
    setStorageItem(ACTIVE_CLASSROOM_KEY, id);
  } catch (e) {
    console.error("Failed to set active classroom:", e);
  }
}

function getClassroomStateKey(classroomId: ClassroomId): string {
  return `classnotes_state_${classroomId}_v1`;
}

function getLastSyncedKey(classroomId: ClassroomId): string {
  return `classnotes_last_synced_${classroomId}_v1`;
}

export function getLastSyncedTimestamp(classroomId: ClassroomId): number {
  try {
    const raw = getStorageItem(getLastSyncedKey(classroomId));
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function setLastSyncedTimestamp(classroomId: ClassroomId, timestamp: number): void {
  try {
    setStorageItem(getLastSyncedKey(classroomId), String(timestamp));
  } catch (e) {
    console.error("Failed to set last synced timestamp:", e);
  }
}

export function loadLocalState(classroomId?: ClassroomId): AppState {
  const cid: ClassroomId = classroomId || getActiveClassroomId();
  const baseInitial = getInitialStateForClassroom(cid);

  try {
    let raw = getStorageItem(getClassroomStateKey(cid));
    // Migration fallback for Sara
    if (!raw && cid === "sara") {
      raw = getStorageItem(LEGACY_SARA_STATE_KEY);
    }

    if (!raw) return baseInitial;
    const parsed = JSON.parse(raw);

    const students =
      Array.isArray(parsed.students) && parsed.students.length > 0
        ? parsed.students
        : baseInitial.students;
    const categories =
      Array.isArray(parsed.categories) && parsed.categories.length > 0
        ? parsed.categories
        : baseInitial.categories;

    const state: AppState = {
      ...baseInitial,
      ...parsed,
      students,
      categories,
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

    // If local storage had empty students or categories, heal it immediately
    if (
      !Array.isArray(parsed.students) ||
      parsed.students.length === 0 ||
      !Array.isArray(parsed.categories) ||
      parsed.categories.length === 0
    ) {
      saveLocalState(state, cid);
    }

    return state;
  } catch (e) {
    console.error(`Failed to load local state for ${cid}:`, e);
    return baseInitial;
  }
}

export function saveLocalState(state: AppState, classroomId?: ClassroomId): void {
  const cid: ClassroomId = classroomId || state.classroomId || getActiveClassroomId();
  try {
    const toSave: AppState = {
      ...state,
      classroomId: cid,
      updatedAt: state.updatedAt || Date.now(),
    };
    const serialized = JSON.stringify(toSave);
    setStorageItem(getClassroomStateKey(cid), serialized);
    if (cid === "sara") {
      setStorageItem(LEGACY_SARA_STATE_KEY, serialized);
    }
  } catch (e) {
    console.error(`Failed to save local state for ${cid}:`, e);
  }
}

export async function fetchServerState(classroomId?: ClassroomId): Promise<AppState | null> {
  const cid: ClassroomId = classroomId || getActiveClassroomId();
  const baseInitial = getInitialStateForClassroom(cid);
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
        setLastSyncedTimestamp(cid, localState.updatedAt || Date.now());
      }
      return localState;
    }

    const rawServerState = data.state as AppState;
    const serverStudents =
      Array.isArray(rawServerState.students) && rawServerState.students.length > 0
        ? rawServerState.students
        : baseInitial.students;
    const serverCategories =
      Array.isArray(rawServerState.categories) && rawServerState.categories.length > 0
        ? rawServerState.categories
        : baseInitial.categories;

    const serverState: AppState = {
      ...baseInitial,
      ...rawServerState,
      students: serverStudents,
      categories: serverCategories,
      classroomId: cid,
    };

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
      setLastSyncedTimestamp(cid, serverTime);
      return serverState;
    }

    // 2. If timestamps are equal (or both 0), but local has edits and server is empty, local wins
    if (serverTime === localTime && localHasEdits && !serverHasEdits) {
      syncStateToServer(localState, cid);
      setLastSyncedTimestamp(cid, localTime);
      return localState;
    }

    // 3. If local timestamp is newer, local wins and updates server
    if (localTime > serverTime) {
      syncStateToServer(localState, cid);
      setLastSyncedTimestamp(cid, localTime);
      return localState;
    }

    // Default: accept server state
    saveLocalState(serverState, cid);
    setLastSyncedTimestamp(cid, serverTime);
    return serverState;
  } catch (e) {
    console.warn(`Could not sync with server for ${cid}, using local data:`, e);
  }
  return null;
}

export interface SyncResult {
  success: boolean;
  conflict?: boolean;
  offline?: boolean;
  message?: string;
  serverUpdatedAt?: number;
}

export async function syncStateToServerDetailed(
  state: AppState,
  classroomId?: ClassroomId,
  force: boolean = false
): Promise<SyncResult> {
  const cid: ClassroomId = classroomId || state.classroomId || getActiveClassroomId();
  const toSync: AppState = {
    ...state,
    classroomId: cid,
    updatedAt: force ? Date.now() : (state.updatedAt || Date.now()),
  };
  saveLocalState(toSync, cid);
  try {
    const res = await fetch(`/api/data?classroom=${cid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: toSync, force }),
    });
    if (res.ok) {
      setLastSyncedTimestamp(cid, toSync.updatedAt || Date.now());
      return { success: true };
    }
    if (res.status === 409) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        conflict: true,
        message: data.message || "Server has newer notes. Please pull from cloud before syncing.",
        serverUpdatedAt: data.serverUpdatedAt,
      };
    }
    const data = await res.json().catch(() => ({}));
    return {
      success: false,
      message: data.error || data.message || `Server returned error (${res.status})`,
    };
  } catch (e: any) {
    console.warn(`Server sync failed for ${cid} (offline or network error):`, e);
    return {
      success: false,
      offline: true,
      message: e?.message || "Offline or network error",
    };
  }
}

export async function syncStateToServer(
  state: AppState,
  classroomId?: ClassroomId,
  force: boolean = false
): Promise<boolean> {
  const res = await syncStateToServerDetailed(state, classroomId, force);
  return res.success;
}

export interface PullResult {
  status: "updated" | "up_to_date" | "conflict_unsaved" | "server_empty" | "offline";
  serverState?: AppState;
  message: string;
}

export interface PullOptions {
  force?: boolean;
  hasLocalUnsaved?: boolean;
}

export async function pullServerState(
  classroomId?: ClassroomId,
  options?: PullOptions
): Promise<PullResult> {
  const cid: ClassroomId = classroomId || getActiveClassroomId();
  const baseInitial = getInitialStateForClassroom(cid);
  try {
    let res: Response;
    try {
      res = await fetch(`/api/data?classroom=${cid}`, { cache: "no-store" });
    } catch (netErr: any) {
      return {
        status: "offline",
        message: "Could not reach cloud (offline).",
      };
    }

    if (!res.ok) {
      return {
        status: "offline",
        message: `Server returned status (${res.status}). Notes saved locally.`,
      };
    }

    const data = await res.json().catch(() => null);
    if (!data || !data.hasSavedState || !data.state) {
      return {
        status: "server_empty",
        message: "No cloud data found for this classroom yet.",
      };
    }

    const rawServerState = data.state as AppState;
    const serverStudents =
      Array.isArray(rawServerState.students) && rawServerState.students.length > 0
        ? rawServerState.students
        : baseInitial.students;
    const serverCategories =
      Array.isArray(rawServerState.categories) && rawServerState.categories.length > 0
        ? rawServerState.categories
        : baseInitial.categories;

    const serverState: AppState = {
      ...baseInitial,
      ...rawServerState,
      students: serverStudents,
      categories: serverCategories,
      classroomId: cid,
    };

    const localState = loadLocalState(cid);
    const serverTime = serverState.updatedAt || 0;
    const localTime = localState.updatedAt || 0;

    // If force is specified (user chose "Pull Cloud Notes" to overwrite local draft)
    if (options?.force) {
      saveLocalState(serverState, cid);
      setLastSyncedTimestamp(cid, serverTime);
      return {
        status: "updated",
        serverState,
        message: "Loaded latest notes from cloud.",
      };
    }

    // Check if entries are identical
    const areEntriesIdentical =
      JSON.stringify(localState.entries) === JSON.stringify(serverState.entries);

    if (serverTime === localTime || (areEntriesIdentical && serverTime <= localTime)) {
      return {
        status: "up_to_date",
        serverState,
        message: "Already up to date with cloud.",
      };
    }

    // Check for unsaved local edits
    const lastSynced = getLastSyncedTimestamp(cid);
    const hasUnsaved =
      Boolean(options?.hasLocalUnsaved) ||
      (lastSynced > 0 && localTime > lastSynced) ||
      (!areEntriesIdentical && localTime > serverTime);

    if (hasUnsaved && !areEntriesIdentical) {
      return {
        status: "conflict_unsaved",
        serverState,
        message: "You have unsaved local edits on this device, and the cloud has newer notes.",
      };
    }

    // Server is newer and local has no unsaved conflicts
    if (serverTime > localTime || areEntriesIdentical) {
      saveLocalState(serverState, cid);
      setLastSyncedTimestamp(cid, serverTime);
      return {
        status: "updated",
        serverState,
        message: "Updated with latest notes from cloud!",
      };
    }

    return {
      status: "up_to_date",
      serverState,
      message: "Already up to date with cloud.",
    };
  } catch (e: any) {
    return {
      status: "offline",
      message: e?.message || "Network error while checking cloud.",
    };
  }
}

// 30-day session token helpers
export function getAuthSession(): AuthSession | null {
  try {
    const raw = getStorageItem(AUTH_TOKEN_KEY);
    if (raw) {
      const session: AuthSession = JSON.parse(raw);
      if (session.expiresAt && new Date().getTime() <= session.expiresAt) {
        return session;
      }
      removeStorageItem(AUTH_TOKEN_KEY);
    }

    // Check legacy token
    const legacyRaw = getStorageItem(LEGACY_AUTH_TOKEN_KEY);
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
      removeStorageItem(LEGACY_AUTH_TOKEN_KEY);
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
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const session: AuthSession = {
    authenticated: true,
    role,
    classroomId,
    expiresAt: new Date().getTime() + thirtyDaysMs,
  };
  setStorageItem(AUTH_TOKEN_KEY, JSON.stringify(session));
  if (classroomId !== "all") {
    setActiveClassroomId(classroomId);
  }
}

export function clearAuthSession(): void {
  removeStorageItem(AUTH_TOKEN_KEY);
  removeStorageItem(LEGACY_AUTH_TOKEN_KEY);
}
