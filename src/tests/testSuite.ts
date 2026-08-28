import { formatFriendlyDate, formatIndividualStudentEmail, formatMasterSummaryEmail } from "../lib/emailFormatter";
import { initialAppState, initialCategories, initialStudents, createDefaultEntries } from "../lib/initialData";
import { sendAllReports } from "../lib/emailSender";
import { AppState, DailyStudentEntry } from "../lib/types";

console.log("\n========================================================");
console.log(" 🧪 SARA'S CLASSROOM SYSTEM - AUTOMATED TEST SUITE");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function run() {
  // TEST 1: Date formatting
  try {
    const friendly = formatFriendlyDate("2026-08-28");
    assert(friendly.includes("August") && friendly.includes("2026"), "Date formats to human readable string (e.g. August 28, 2026)");
  } catch (e: any) {
    assert(false, `Date formatting error: ${e.message}`);
  }

  // TEST 2: Individual student plain text email
  try {
    const student = initialStudents[0]; // Alex T.
    const entry: DailyStudentEntry = {
      studentId: student.id,
      selections: {
        "cat-breakfast": "opt-bk-all",
        "cat-rest": "opt-rest-nap",
        "cat-behavior": "opt-beh-well",
        "cat-therapy": "opt-th-great",
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

    assert(formatted.subject === "Daily Student Report: Alex T. - 2026-08-28", "Subject line matches 'Daily Student Report: Alex T. - 2026-08-28'");
    assert(formatted.text.includes("DAILY STUDENT REPORT"), "Email contains main header");
    assert(formatted.text.includes("Student: Alex T."), "Email includes student name");
    assert(formatted.text.includes("• Breakfast Report: Ate all / ate well"), "Email correctly includes Breakfast selection");
    assert(formatted.text.includes("• Rest / Nap Information: Took a good nap"), "Email correctly includes Rest selection");
    assert(formatted.text.includes("• Basic Behavior & Mood: Well behaved / happy & calm"), "Email correctly includes Behavior selection");
    assert(formatted.text.includes("TEACHER NOTES (Part 1):\nAlex had a wonderful morning working on sensory blocks."), "Email formats Notes 1 accurately");
    assert(formatted.text.includes("ADDITIONAL NOTES (Part 2):\nPlease send extra wet wipes tomorrow."), "Email formats Notes 2 accurately");
  } catch (e: any) {
    assert(false, `Individual email test error: ${e.message}`);
  }

  // TEST 3: Master summary email formatting
  try {
    const state: AppState = {
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
    assert(master.subject === "Master Classroom Daily Summary - 2026-08-28 (3 Students)", "Master email subject includes date and 3 students count");
    assert(master.text.includes("MASTER CLASSROOM DAILY SUMMARY REPORT"), "Master email contains main header");
    assert(master.text.includes("[1/3] STUDENT: Alex T."), "Master email includes student #1");
    assert(master.text.includes("[2/3] STUDENT: Jordan M."), "Master email includes student #2");
    assert(master.text.includes("[3/3] STUDENT: Sam K."), "Master email includes student #3");
    assert(master.text.includes("Notes 1: Alex notes"), "Master email contains student 1 notes");
    assert(master.text.includes("Notes 1: Jordan notes"), "Master email contains student 2 notes");
    assert(master.text.includes("Notes 1: Sam notes"), "Master email contains student 3 notes");
  } catch (e: any) {
    assert(false, `Master email test error: ${e.message}`);
  }

  // TEST 4: Default entry generation & Reset for next day
  try {
    const defaults = createDefaultEntries(initialStudents, initialCategories);
    assert(Object.keys(defaults).length === 3, "Defaults created for all 3 sample students");
    assert(defaults["student-1"].notes1 === "", "Notes 1 starts empty on reset");
    assert(defaults["student-1"].notes2 === "", "Notes 2 starts empty on reset");
    assert(defaults["student-1"].selections["cat-breakfast"] === "opt-bk-none", "Breakfast defaults to 'No report'");
    assert(defaults["student-1"].selections["cat-rest"] === "opt-rest-none", "Rest defaults to 'No report'");
    assert(defaults["student-1"].selections["cat-behavior"] === "opt-beh-none", "Behavior defaults to 'No report'");
    assert(defaults["student-1"].selections["cat-therapy"] === "opt-th-none", "Therapy defaults to 'No report'");
  } catch (e: any) {
    assert(false, `Reset & defaults test error: ${e.message}`);
  }

  // TEST 5: Email Simulator Dispatch (Dry-Run Mode)
  try {
    const simResult = await sendAllReports(initialAppState, true);
    assert(simResult.success === true, "Simulator mode dispatches successfully");
    assert(simResult.sentCount === 4, `Simulator dispatched 4 emails (3 individual student reports + 1 master recipient)`);
    assert(simResult.logs.some(l => l.type === "master" && l.status === "simulated"), "Simulator generated simulated master email logs");
    assert(simResult.logs.some(l => l.type === "individual" && l.studentName === "Alex T."), "Simulator generated simulated individual report for Alex T.");
    assert(simResult.logs.some(l => l.type === "individual" && l.studentName === "Jordan M."), "Simulator generated simulated individual report for Jordan M.");
    assert(simResult.logs.some(l => l.type === "individual" && l.studentName === "Sam K."), "Simulator generated simulated individual report for Sam K.");
  } catch (e: any) {
    assert(false, `Simulator test error: ${e.message}`);
  }

  // TEST 6: Missing Credentials Safeguards
  try {
    const unconfiguredGmailState: AppState = {
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
    const gmailResult = await sendAllReports(unconfiguredGmailState, false);
    assert(gmailResult.success === false, "Missing Gmail credentials properly blocked dispatch");
    assert(gmailResult.message.includes("Gmail configuration missing"), "Safeguard returned helpful instruction to set Gmail credentials");

    const unconfiguredBrevoState: AppState = {
      ...initialAppState,
      settings: {
        ...initialAppState.settings,
        emailSettings: {
          ...initialAppState.settings.emailSettings,
          provider: "brevo",
          brevoApiKey: "",
        },
      },
    };
    const brevoResult = await sendAllReports(unconfiguredBrevoState, false);
    assert(brevoResult.success === false, "Missing Brevo API key properly blocked dispatch");
    assert(brevoResult.message.includes("Brevo API Key missing"), "Safeguard returned helpful instruction to set Brevo API key");
  } catch (e: any) {
    assert(false, `Credentials safeguards test error: ${e.message}`);
  }

  console.log("\n========================================================");
  console.log(` 📊 FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
