import { NextRequest, NextResponse } from "next/server";
import { sendAllReports } from "@/lib/emailSender";
import { AppState } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const state: AppState = body.state;
    const forceSimulator: boolean = !!body.forceSimulator;

    if (!state) {
      return NextResponse.json({ error: "Missing state payload" }, { status: 400 });
    }

    const result = await sendAllReports(state, forceSimulator);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API send error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal server error during email dispatch",
        sentCount: 0,
        logs: [],
      },
      { status: 500 }
    );
  }
}
