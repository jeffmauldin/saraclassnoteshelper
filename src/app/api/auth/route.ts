import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ClassroomId } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");

function getCustomPassphrase(classroomId: ClassroomId): string | null {
  const filePath = path.join(DATA_DIR, `state_${classroomId}.json`);
  const legacyFile = path.join(DATA_DIR, "app_state.json");

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed?.settings?.passphrase) return parsed.settings.passphrase;
    } else if (classroomId === "sara" && fs.existsSync(legacyFile)) {
      const content = fs.readFileSync(legacyFile, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed?.settings?.passphrase) return parsed.settings.passphrase;
    }
  } catch (e) {
    console.warn(`Could not read custom passphrase for ${classroomId}:`, e);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { passphrase, requestedClassroom } = await req.json();

    const saraCustom = getCustomPassphrase("sara");
    const meganCustom = getCustomPassphrase("megan");

    const saraPass = saraCustom || "sara2026";
    const meganPass = meganCustom || "megan2026";
    const adminPass = "admin2026";

    // 1. Admin authentication
    if (passphrase === adminPass) {
      const targetClassroom: ClassroomId = requestedClassroom === "megan" ? "megan" : "sara";
      return NextResponse.json({
        success: true,
        role: "admin",
        classroomId: targetClassroom,
        message: "Admin access authenticated successfully.",
      });
    }

    // 2. Specific classroom requested or auto-detected
    if (passphrase === saraPass || passphrase === "sara2026") {
      if (requestedClassroom === "megan") {
        return NextResponse.json(
          { success: false, message: "This passcode is for Sara's Classroom, not Megan's." },
          { status: 401 }
        );
      }
      return NextResponse.json({
        success: true,
        role: "teacher",
        classroomId: "sara",
        message: "Authenticated to Sara's Classroom.",
      });
    }

    if (passphrase === meganPass || passphrase === "megan2026") {
      if (requestedClassroom === "sara") {
        return NextResponse.json(
          { success: false, message: "This passcode is for Megan's Classroom, not Sara's." },
          { status: 401 }
        );
      }
      return NextResponse.json({
        success: true,
        role: "teacher",
        classroomId: "megan",
        message: "Authenticated to Megan's Classroom.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Incorrect passcode. Please try again." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Auth error" }, { status: 500 });
  }
}

