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
        return {
          ...initial,
          ...parsed,
          classroomId,
          settings: {
            ...initial.settings,
            ...(parsed.settings || {}),
            emailSettings: {
              ...initial.settings.emailSettings,
              ...(parsed.settings?.emailSettings || {}),
            },
          },
        };
      }
    }

    // 2. Check bundled repo file
    if (fs.existsSync(repoPath)) {
      const content = fs.readFileSync(repoPath, "utf-8");
      if (content.trim()) {
        const parsed = JSON.parse(content);
        return {
          ...initial,
          ...parsed,
          classroomId,
          settings: {
            ...initial.settings,
            ...(parsed.settings || {}),
            emailSettings: {
              ...initial.settings.emailSettings,
              ...(parsed.settings?.emailSettings || {}),
            },
          },
        };
      }
    }

    // 3. Check legacy app_state.json for Sara
    if (classroomId === "sara" && fs.existsSync(legacyRepoPath)) {
      const content = fs.readFileSync(legacyRepoPath, "utf-8");
      if (content.trim()) {
        const parsed = JSON.parse(content);
        return {
          ...initial,
          ...parsed,
          classroomId: "sara",
          settings: {
            ...initial.settings,
            ...(parsed.settings || {}),
            emailSettings: {
              ...initial.settings.emailSettings,
              ...(parsed.settings?.emailSettings || {}),
            },
          },
        };
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
        state: {
          ...initial,
          ...cloudState,
          classroomId,
          settings: {
            ...initial.settings,
            ...(cloudState.settings || {}),
            emailSettings: {
              ...initial.settings.emailSettings,
              ...(cloudState.settings?.emailSettings || {}),
            },
          },
        },
        hasSavedState: true,
      };
    }

    // Seed cloud from disk if available
    const diskFallback = readDiskState(classroomId);
    if (diskFallback) {
      await setCloudState(diskFallback, classroomId);
      return { state: diskFallback, hasSavedState: true };
    }

    return { state: null, hasSavedState: false };
  }

  const diskState = readDiskState(classroomId);
  if (diskState) {
    return { state: diskState, hasSavedState: true };
  }

  return { state: null, hasSavedState: false };
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
  const { searchParams } = new URL(req.url);
  const classroomId = normalizeClassroomId(searchParams.get("classroom"));
  const { state, hasSavedState } = await readSavedState(classroomId);
  const cloudActive = isCloudStorageConfigured();
  const fallbackState = getInitialStateForClassroom(classroomId);

  return NextResponse.json({
    state: state || fallbackState,
    hasSavedState,
    storage: {
      mode: cloudActive ? "cloud" : "local",
      cloudConfigured: cloudActive,
    },
  });
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
    const toSave: AppState = {
      ...body.state,
      classroomId,
      updatedAt: body.state.updatedAt || Date.now(),
    };
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
