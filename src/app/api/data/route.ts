import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getInitialStateForClassroom } from "@/lib/initialData";
import { AppState, ClassroomId } from "@/lib/types";
import { getCloudState, isCloudStorageConfigured, setCloudState } from "@/lib/cloudStorage";

function normalizeClassroomId(id: string | null): ClassroomId {
  return id === "megan" ? "megan" : "sara";
}

function getDataDir(): string {
  // On Vercel / serverless, process.cwd() is read-only (/var/task). Use /tmp instead.
  if (process.env.VERCEL) {
    return path.join("/tmp", ".data");
  }
  return path.join(process.cwd(), ".data");
}

function getClassroomFilePath(classroomId: ClassroomId): string {
  return path.join(getDataDir(), `state_${classroomId}.json`);
}

function hydrateState(raw: any, initial: AppState, classroomId: ClassroomId): AppState {
  const students =
    Array.isArray(raw?.students) && raw.students.length > 0 ? raw.students : initial.students;
  const categories =
    Array.isArray(raw?.categories) && raw.categories.length > 0 ? raw.categories : initial.categories;

  return {
    ...initial,
    ...(raw || {}),
    students,
    categories,
    classroomId,
    settings: {
      ...initial.settings,
      ...(raw?.settings || {}),
      emailSettings: {
        ...initial.settings.emailSettings,
        ...(raw?.settings?.emailSettings || {}),
      },
    },
  };
}

function readDiskState(classroomId: ClassroomId): AppState | null {
  const initial = getInitialStateForClassroom(classroomId);
  const primaryPath = getClassroomFilePath(classroomId);
  const repoPath = path.join(process.cwd(), ".data", `state_${classroomId}.json`);
  const legacyRepoPath = path.join(process.cwd(), ".data", "app_state.json");

  try {
    // 1. Check writable data directory first (e.g. /tmp/.data on Vercel)
    if (fs.existsSync(primaryPath)) {
      const content = fs.readFileSync(primaryPath, "utf-8");
      if (content.trim()) {
        const parsed = JSON.parse(content);
        return hydrateState(parsed, initial, classroomId);
      }
    }

    // 2. Check bundled repo file
    if (fs.existsSync(repoPath)) {
      const content = fs.readFileSync(repoPath, "utf-8");
      if (content.trim()) {
        const parsed = JSON.parse(content);
        return hydrateState(parsed, initial, classroomId);
      }
    }

    // 3. Check legacy app_state.json for Sara
    if (classroomId === "sara" && fs.existsSync(legacyRepoPath)) {
      const content = fs.readFileSync(legacyRepoPath, "utf-8");
      if (content.trim()) {
        const parsed = JSON.parse(content);
        return hydrateState(parsed, initial, "sara");
      }
    }
  } catch (e) {
    console.error(`Error reading disk data for ${classroomId}:`, e);
  }

  return null;
}

function writeDiskState(state: AppState, classroomId: ClassroomId): void {
  try {
    const dir = getDataDir();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = getClassroomFilePath(classroomId);
    const toWrite: AppState = {
      ...state,
      classroomId,
      updatedAt: state.updatedAt || Date.now(),
    };
    fs.writeFileSync(filePath, JSON.stringify(toWrite, null, 2), "utf-8");
  } catch (e) {
    console.warn(`Disk write skipped for ${classroomId}:`, e);
  }
}

async function readSavedState(
  classroomId: ClassroomId
): Promise<{ state: AppState | null; hasSavedState: boolean }> {
  const initial = getInitialStateForClassroom(classroomId);

  if (isCloudStorageConfigured()) {
    const cloudState = await getCloudState(classroomId);
    if (cloudState) {
      return {
        state: hydrateState(cloudState, initial, classroomId),
        hasSavedState: true,
      };
    }

    // Seed cloud from disk if available
    const diskFallback = readDiskState(classroomId);
    if (diskFallback) {
      await setCloudState(diskFallback, classroomId);
      return { state: diskFallback, hasSavedState: true };
    }

    return { state: initial, hasSavedState: false };
  }

  const diskState = readDiskState(classroomId);
  if (diskState) {
    return { state: diskState, hasSavedState: true };
  }

  return { state: initial, hasSavedState: false };
}

async function writeSavedState(state: AppState, classroomId: ClassroomId): Promise<void> {
  const toWrite: AppState = {
    ...state,
    classroomId,
    updatedAt: state.updatedAt || Date.now(),
  };

  if (isCloudStorageConfigured()) {
    await setCloudState(toWrite, classroomId);
  }

  writeDiskState(toWrite, classroomId);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = normalizeClassroomId(searchParams.get("classroom"));
    const { state, hasSavedState } = await readSavedState(classroomId);
    const cloudActive = isCloudStorageConfigured();
    const fallbackState = getInitialStateForClassroom(classroomId);

    return NextResponse.json({
      state: state || fallbackState,
      hasSavedState: Boolean(hasSavedState && state),
      storage: {
        mode: cloudActive ? "cloud" : "local",
        cloudConfigured: cloudActive,
      },
    });
  } catch (err: any) {
    console.error("GET /api/data error:", err);
    const fallbackState = getInitialStateForClassroom("sara");
    return NextResponse.json({
      state: fallbackState,
      hasSavedState: false,
      storage: {
        mode: "local",
        cloudConfigured: false,
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    if (!body || !body.state) {
      return NextResponse.json({ error: "Missing state payload" }, { status: 400 });
    }
    const classroomId = normalizeClassroomId(
      body.state.classroomId || searchParams.get("classroom")
    );
    const initial = getInitialStateForClassroom(classroomId);
    const { state: existingState } = await readSavedState(classroomId);

    // Hydrate toSave so students and categories are never empty arrays
    const toSave: AppState = hydrateState(body.state, existingState || initial, classroomId);
    toSave.updatedAt = body.state.updatedAt || Date.now();

    const isForce = body.force === true || searchParams.get("force") === "true";

    const areEntriesIdentical =
      Boolean(existingState?.entries) &&
      JSON.stringify(toSave.entries) === JSON.stringify(existingState?.entries);

    // If content is already identical and server has an equal or newer timestamp, treat as success
    if (
      areEntriesIdentical &&
      existingState?.updatedAt &&
      toSave.updatedAt &&
      toSave.updatedAt <= existingState.updatedAt
    ) {
      const cloudActive = isCloudStorageConfigured();
      return NextResponse.json({
        success: true,
        state: existingState,
        storage: {
          mode: cloudActive ? "cloud" : "local",
          cloudConfigured: cloudActive,
        },
      });
    }

    // Check if client has actual typed notes
    const clientHasEdits = Object.values(toSave.entries || {}).some(
      (e) => (e.notes1 && e.notes1.trim().length > 0) || (e.notes2 && e.notes2.trim().length > 0)
    );

    // Guard against corrupted future timestamps (e.g. from tests or clock drift)
    if (existingState?.updatedAt && existingState.updatedAt > Date.now() + 86400000) {
      existingState.updatedAt = 0;
    }

    // Guard against stale clients overwriting newer server data unless force is explicitly set
    if (
      !isForce &&
      !areEntriesIdentical &&
      existingState &&
      existingState.updatedAt &&
      toSave.updatedAt &&
      toSave.updatedAt < existingState.updatedAt
    ) {
      // If client has NO actual edits and server has newer notes,
      // allow client to gracefully adopt server state without throwing conflict
      if (!clientHasEdits) {
        const cloudActive = isCloudStorageConfigured();
        return NextResponse.json({
          success: true,
          state: existingState,
          storage: {
            mode: cloudActive ? "cloud" : "local",
            cloudConfigured: cloudActive,
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          conflict: true,
          message: "Server has newer notes. Please pull from cloud before syncing.",
          serverUpdatedAt: existingState.updatedAt,
        },
        { status: 409 }
      );
    }

    await writeSavedState(toSave, classroomId);
    const cloudActive = isCloudStorageConfigured();

    return NextResponse.json({
      success: true,
      state: toSave,
      storage: {
        mode: cloudActive ? "cloud" : "local",
        cloudConfigured: cloudActive,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save state" }, { status: 500 });
  }
}
