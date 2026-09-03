import { describe, it, expect } from "vitest";
import { initialAppState } from "@/lib/initialData";
import { sendAllReports } from "@/lib/emailSender";

describe("Validation & Safeguards", () => {
  it("runs simulator mode without errors and logs all recipients", async () => {
    const result = await sendAllReports(initialAppState, true);
    expect(result.success).toBe(true);
    expect(result.sentCount).toBeGreaterThanOrEqual(4); // 3 students + 2 master recipients (total simulated items)
    expect(result.logs.some((l) => l.type === "master")).toBe(true);
    expect(result.logs.some((l) => l.type === "individual")).toBe(true);
  });

  it("handles missing Gmail credentials gracefully", async () => {
    const invalidGmailState = {
      ...initialAppState,
      settings: {
        ...initialAppState.settings,
        emailSettings: {
          ...initialAppState.settings.emailSettings,
          provider: "gmail" as const,
          gmailUser: "",
          gmailAppPassword: "",
        },
      },
    };

    const result = await sendAllReports(invalidGmailState, false);
    expect(result.success).toBe(false);
    expect(result.message).toContain("Gmail configuration missing");
  });
});
