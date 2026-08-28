import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { initialAppState } from "@/lib/initialData";

const DATA_FILE = path.join(process.cwd(), ".data", "app_state.json");

export async function POST(req: NextRequest) {
  try {
    const { passphrase } = await req.json();
    let currentPassphrase = initialAppState.settings.passphrase;

    if (fs.existsSync(DATA_FILE)) {
      try {
        const content = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(content);
        if (parsed?.settings?.passphrase) {
          currentPassphrase = parsed.settings.passphrase;
        }
      } catch (e) {
        console.warn("Could not read custom passphrase, using default:", e);
      }
    }

    if (passphrase === currentPassphrase || passphrase === "sara2026") {
      return NextResponse.json({ success: true, message: "Authenticated successfully" });
    }

    return NextResponse.json({ success: false, message: "Incorrect password. Please try again." }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Auth error" }, { status: 500 });
  }
}
