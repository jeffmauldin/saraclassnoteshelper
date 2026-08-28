import { describe, it, expect } from "vitest";
import { createDefaultEntries, initialCategories, initialStudents } from "@/lib/initialData";
import { AppState } from "@/lib/types";

describe("State Management & Reset Behavior", () => {
  it("creates default entries matching category defaultOptionId", () => {
    const defaults = createDefaultEntries(initialStudents, initialCategories);

    for (const student of initialStudents) {
      const entry = defaults[student.id];
      expect(entry).toBeDefined();
      expect(entry.notes1).toBe("");
      expect(entry.notes2).toBe("");

      for (const cat of initialCategories) {
        expect(entry.selections[cat.id]).toBe(cat.defaultOptionId);
      }
    }
  });

  it("resets classroom state properly for next day", () => {
    const dirtyState: AppState = {
      students: initialStudents,
      categories: initialCategories,
      entries: {
        "student-1": {
          studentId: "student-1",
          selections: { "cat-breakfast": "opt-bk-all" },
          notes1: "Some custom notes from today",
          notes2: "More notes",
        },
      },
      currentDate: "2026-08-28",
      sentDate: "2026-08-28",
      lastResetDate: "2026-08-28",
      settings: {
        passphrase: "sara2026",
        emailSettings: {
          provider: "simulator",
          gmailUser: "sara@example.com",
          fromName: "Sara",
          masterRecipients: ["sara@example.com"],
        },
      },
    };

    // Perform Reset for Next Day
    const freshEntries = createDefaultEntries(dirtyState.students, dirtyState.categories);
    const resetState: AppState = {
      ...dirtyState,
      entries: freshEntries,
      sentDate: null,
      lastResetDate: "2026-08-29",
    };

    expect(resetState.sentDate).toBeNull();
    expect(resetState.entries["student-1"].notes1).toBe("");
    expect(resetState.entries["student-1"].notes2).toBe("");
    expect(resetState.entries["student-1"].selections["cat-breakfast"]).toBe("opt-bk-none");
  });
});
