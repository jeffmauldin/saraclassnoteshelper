import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { initialAppState } from "@/lib/initialData";
import { AppState } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "app_state.json");

let memoryState: AppState = initialAppState;

function readSavedState(): AppState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      if (content.trim()) {
        const parsed = JSON.parse(content);
        memoryState = {
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
        return memoryState;
      }
    }
  } catch (e) {
    console.error("Error reading data file, using in-memory state:", e);
  }
  return memoryState;
}

function writeSavedState(state: AppState): void {
  memoryState = state;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving state to file:", e);
  }
}

export async function GET() {
  const state = readSavedState();
  return NextResponse.json({ state });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.state) {
      return NextResponse.json({ error: "Missing state payload" }, { status: 400 });
    }
    writeSavedState(body.state);
    return NextResponse.json({ success: true, state: body.state });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save state" }, { status: 500 });
  }
}
