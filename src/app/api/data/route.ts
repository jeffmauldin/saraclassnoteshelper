import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getInitialStateForClassroom } from "@/lib/initialData";
import { AppState, ClassroomId } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");

function normalizeClassroomId(id: string | null): ClassroomId {
  return id === "megan" ? "megan" : "sara";
}

function getClassroomFilePath(classroomId: ClassroomId): string {
  return path.join(DATA_DIR, `state_${classroomId}.json`);
}

function readSavedState(classroomId: ClassroomId): AppState {
  const initial = getInitialStateForClassroom(classroomId);
  const filePath = getClassroomFilePath(classroomId);
  const legacyPath = path.join(DATA_DIR, "app_state.json");

  try {
    // Migration: If loading sara and state_sara doesn't exist, check legacy app_state.json
    if (!fs.existsSync(filePath) && classroomId === "sara" && fs.existsSync(legacyPath)) {
      try {
        const legacyContent = fs.readFileSync(legacyPath, "utf-8");
        if (legacyContent.trim()) {
          const parsed = JSON.parse(legacyContent);
          const migrated: AppState = {
            ...initial,
            ...parsed,
            classroomId: "sara",
          };
          writeSavedState(migrated, "sara");
          return migrated;
        }
      } catch (migErr) {
        console.warn("Could not migrate legacy app_state.json:", migErr);
      }
    }

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
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
  } catch (e) {
    console.error(`Error reading data for ${classroomId}, using defaults:`, e);
  }
  return initial;
}

function writeSavedState(state: AppState, classroomId: ClassroomId): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = getClassroomFilePath(classroomId);
    const toWrite: AppState = { ...state, classroomId };
    fs.writeFileSync(filePath, JSON.stringify(toWrite, null, 2), "utf-8");
  } catch (e) {
    console.error(`Error saving state for ${classroomId}:`, e);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classroomId = normalizeClassroomId(searchParams.get("classroom"));
  const state = readSavedState(classroomId);
  return NextResponse.json({ state });
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
    writeSavedState(body.state, classroomId);
    return NextResponse.json({ success: true, state: body.state });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save state" }, { status: 500 });
  }
}

