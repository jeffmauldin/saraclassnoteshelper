import { AppState, ClassroomId } from "./types";

/**
 * Checks if cloud key-value storage (Upstash Redis or Vercel KV) is configured via environment variables.
 * Compatible with Vercel KV (KV_REST_API_URL/KV_REST_API_TOKEN)
 * and Upstash Redis (UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN).
 */
export function isCloudStorageConfigured(): boolean {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return Boolean(url && token);
}

function getCloudConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

/**
 * Reads state for a classroom from cloud key-value store.
 */
export async function getCloudState(classroomId: ClassroomId): Promise<AppState | null> {
  const config = getCloudConfig();
  if (!config) return null;

  const key = `classnotes_state_${classroomId}`;

  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["GET", key]),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`Cloud storage GET failed for ${classroomId} with status ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (!data || data.result === null || data.result === undefined) {
      return null;
    }

    const parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
    return parsed as AppState;
  } catch (err) {
    console.error(`Error fetching cloud state for ${classroomId}:`, err);
    return null;
  }
}

/**
 * Writes state for a classroom to cloud key-value store.
 */
export async function setCloudState(state: AppState, classroomId: ClassroomId): Promise<boolean> {
  const config = getCloudConfig();
  if (!config) return false;

  const key = `classnotes_state_${classroomId}`;
  const payload = JSON.stringify({ ...state, classroomId });

  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", key, payload]),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`Cloud storage SET failed for ${classroomId} with status ${res.status}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Error writing cloud state for ${classroomId}:`, err);
    return false;
  }
}
