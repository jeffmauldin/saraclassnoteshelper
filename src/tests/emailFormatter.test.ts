import { describe, it, expect } from "vitest";
import {
  formatFriendlyDate,
  formatIndividualStudentEmail,
  formatMasterSummaryEmail,
} from "@/lib/emailFormatter";
import { initialAppState, initialCategories, initialStudents } from "@/lib/initialData";

describe("Email Formatter", () => {
  it("formats dates properly into readable English", () => {
    const friendly = formatFriendlyDate("2026-08-28");
    expect(friendly).toContain("August");
    expect(friendly).toContain("2026");
  });

  it("formats individual student plain text email with observations and notes", () => {
    const student = initialStudents[0]; // Alex T.
    const entry = {
      studentId: student.id,
      selections: {
        "cat-breakfast": "opt-bk-all",
        "cat-rest": "opt-rest-nap",
        "cat-behavior": "opt-beh-well",
      },
      notes1: "Alex had a wonderful morning working on sensory blocks.",
      notes2: "Please send extra wet wipes tomorrow.",
    };

    const formatted = formatIndividualStudentEmail(
      student,
      entry,
      initialCategories,
      "2026-08-28",
      "Sara"
    );

    expect(formatted.subject).toBe("Daily Student Report: Alex T. - 2026-08-28");
    expect(formatted.text).toContain("Student: Alex T.");
    expect(formatted.text).toContain("Ate all / ate well");
    expect(formatted.text).toContain("Took a good nap");
    expect(formatted.text).toContain("Well behaved / happy & calm");
    expect(formatted.text).toContain("Alex had a wonderful morning");
    expect(formatted.text).toContain("Please send extra wet wipes tomorrow");
  });

  it("formats consolidated master summary email with all students", () => {
    const state = {
      ...initialAppState,
      entries: {
        "student-1": {
          studentId: "student-1",
          selections: { "cat-breakfast": "opt-bk-all" },
          notes1: "Alex notes",
          notes2: "",
        },
        "student-2": {
          studentId: "student-2",
          selections: { "cat-breakfast": "opt-bk-some" },
          notes1: "Jordan notes",
          notes2: "",
        },
        "student-3": {
          studentId: "student-3",
          selections: { "cat-breakfast": "opt-bk-none" },
          notes1: "Sam notes",
          notes2: "",
        },
      },
    };

    const master = formatMasterSummaryEmail(state, "2026-08-28");

    expect(master.subject).toBe("Master Classroom Daily Summary - 2026-08-28 (3 Students)");
    expect(master.text).toContain("Alex T.");
    expect(master.text).toContain("Jordan M.");
    expect(master.text).toContain("Sam K.");
    expect(master.text).toContain("Alex notes");
    expect(master.text).toContain("Jordan notes");
    expect(master.text).toContain("Sam notes");
  });
});
