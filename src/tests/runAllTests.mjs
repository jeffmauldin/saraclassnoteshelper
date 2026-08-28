import { formatFriendlyDate, formatIndividualStudentEmail, formatMasterSummaryEmail } from "../lib/emailFormatter.js";
import { initialAppState, initialCategories, initialStudents, createDefaultEntries, getTodayDateString } from "../lib/initialData.js";
import { sendAllReports } from "../lib/emailSender.js";

console.log("=== STARTING SARA CLASSROOM TEST SUITE ===");
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

// TEST 1: Date formatting
try {
  const dateStr = "2026-08-28";
  const friendly = formatFriendlyDate(dateStr);
  assert(friendly.includes("August") && friendly.includes("2026"), "Date formatted to readable English");
} catch (e) {
  assert(false, `Date formatting threw error: ${e.message}`);
}

// TEST 2: Individual student plain text email
try {
  const student = initialStudents[0];
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
    "Sara (Special Education Teacher)"
  );

  assert(formatted.subject.includes("Daily Student Report: Alex T."), "Individual email subject has student name");
  assert(formatted.text.includes("DAILY STUDENT REPORT"), "Individual email has header");
  assert(formatted.text.includes("Ate all / ate well"), "Individual email has selected Breakfast observation");
  assert(formatted.text.includes("Took a good nap"), "Individual email has selected Rest observation");
  assert(formatted.text.includes("Well behaved / happy & calm"), "Individual email has selected Behavior observation");
  assert(formatted.text.includes("Alex had a wonderful morning"), "Individual email has Notes 1");
  assert(formatted.text.includes("Please send extra wet wipes tomorrow"), "Individual email has Notes 2");
} catch (e) {
  assert(false, `Individual email formatting failed: ${e.message}`);
}

// TEST 3: Master summary email
try {
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
  assert(master.subject.includes("Master Classroom Daily Summary"), "Master email has correct subject");
  assert(master.text.includes("Alex T.") && master.text.includes("Jordan M.") && master.text.includes("Sam K."), "Master email includes all students");
  assert(master.text.includes("Alex notes") && master.text.includes("Jordan notes") && master.text.includes("Sam notes"), "Master email includes individual student notes");
} catch (e) {
  assert(false, `Master email formatting failed: ${e.message}`);
}

// TEST 4: Reset for next day state behavior
try {
  const defaults = createDefaultEntries(initialStudents, initialCategories);
  assert(defaults["student-1"] !== undefined, "Default entries created for student-1");
  assert(defaults["student-1"].notes1 === "" && defaults["student-1"].notes2 === "", "Default notes are empty");
  assert(defaults["student-1"].selections["cat-breakfast"] === "opt-bk-none", "Default breakfast selection is opt-bk-none");
} catch (e) {
  assert(false, `Default entry generation failed: ${e.message}`);
}

// TEST 5: Simulator Mode Email Dispatch
try {
  const result = await sendAllReports(initialAppState, true);
  assert(result.success === true, "Simulator mode dispatches successfully");
  assert(result.sentCount >= 4, `Simulator generated ${result.sentCount} emails (at least 3 students + master recipients)`);
  assert(result.logs.some(l => l.type === "master"), "Simulator includes master summary in logs");
  assert(result.logs.some(l => l.type === "individual"), "Simulator includes individual student reports in logs");
} catch (e) {
  assert(false, `Simulator dispatch failed: ${e.message}`);
}

// TEST 6: Gmail Missing Password Safeguard
try {
  const invalidState = {
    ...initialAppState,
    settings: {
      ...initialAppState.settings,
      emailSettings: {
        ...initialAppState.settings.emailSettings,
        provider: "gmail",
        gmailUser: "",
        gmailAppPassword: "",
      },
    },
  };
  const result = await sendAllReports(invalidState, false);
  assert(result.success === false, "Missing Gmail credentials properly prevented send");
  assert(result.message.includes("Gmail configuration missing"), "Helpful error message returned for missing Gmail credentials");
} catch (e) {
  assert(false, `Missing credentials safeguard test failed: ${e.message}`);
}

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
