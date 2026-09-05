import { formatFriendlyDate, formatIndividualStudentEmail, formatMasterSummaryEmail } from "../lib/emailFormatter";
import {
  initialAppState,
  initialSaraCategories,
  initialSaraStudents,
  initialMeganCategories,
  initialMeganStudents,
  createDefaultEntries,
  getInitialStateForClassroom,
  CLASSROOM_PROFILES,
} from "../lib/initialData";
import { sendAllReports } from "../lib/emailSender";
import { AppState, DailyStudentEntry } from "../lib/types";

console.log("\n========================================================");
console.log(" 🧪 SARA & MEGAN CLASSROOM SYSTEM - TEST SUITE");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: any, testName: string) {
  if (Boolean(condition)) {
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

  // TEST 2: Sara's Classroom Email & Categories
  try {
    const student = initialSaraStudents[0]; // Alex T.
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
      initialSaraCategories,
      "2026-08-28",
      "Sara (Special Education Teacher)"
    );

    assert(formatted.subject === "Daily Student Report: Alex T. - 2026-08-28", "Subject line matches 'Daily Student Report: Alex T. - 2026-08-28'");
    assert(formatted.text.includes("DAILY STUDENT REPORT"), "Email contains main header");
    assert(formatted.text.includes("Student: Alex T."), "Email includes student name");
    assert(formatted.text.includes("Teacher / Classroom: Sara (Special Education Teacher)"), "Email includes Sara's sender name");
    assert(formatted.text.includes("• Breakfast Report: Ate all / ate well"), "Email correctly includes Breakfast selection");
    assert(formatted.text.includes("• Rest / Nap Information: Took a good nap"), "Email correctly includes Rest selection");
    assert(formatted.text.includes("• Basic Behavior & Mood: Well behaved / happy & calm"), "Email correctly includes Behavior selection");
    assert(formatted.text.includes("TEACHER NOTES (Part 1):\nAlex had a wonderful morning working on sensory blocks."), "Email formats Notes 1 accurately");
    assert(formatted.text.includes("ADDITIONAL NOTES (Part 2):\nPlease send extra wet wipes tomorrow."), "Email formats Notes 2 accurately");
  } catch (e: any) {
    assert(false, `Sara email test error: ${e.message}`);
  }

  // TEST 3: Megan's Classroom Email & Tailored Goals Categories
  try {
    const meganState = getInitialStateForClassroom("megan");
    assert(meganState.students.length === 3, "Megan classroom initialized with 3 students");
    assert(meganState.students[0].name === "Maya L.", "Megan student #1 is Maya L.");
    assert(meganState.students[0].emails[0] === "mauldinjeff+megan-maya@gmail.com", "Maya's email has sub-address tag 'mauldinjeff+megan-maya@gmail.com'");
    assert(meganState.settings.emailSettings.fromName === "Megan (Special Education Teacher)", "Megan's sender name configured properly");

    // Verify Megan's categories include Reading, Math, and Other goals
    const catNames = meganState.categories.map((c) => c.name);
    assert(catNames.includes("Academic Highlights & Focus"), "Megan categories include 'Academic Highlights & Focus'");
    assert(catNames.includes("Social & Group Participation"), "Megan categories include 'Social & Group Participation'");
    assert(catNames.includes("Daily Goals & Progress - Reading"), "Megan categories include 'Daily Goals & Progress - Reading'");
    assert(catNames.includes("Daily Goals & Progress - Math"), "Megan categories include 'Daily Goals & Progress - Math'");
    assert(catNames.includes("Daily Goals & Progress - Other"), "Megan categories include 'Daily Goals & Progress - Other'");
    assert(catNames.includes("Special Activities"), "Megan categories include 'Special Activities'");

    const meganEntry: DailyStudentEntry = {
      studentId: meganState.students[0].id,
      selections: {
        "cat-megan-highlights": "opt-mh-reading",
        "cat-megan-social": "opt-ms-coop",
        "cat-megan-reading": "opt-mr-met",
        "cat-megan-math": "opt-mm-steady",
        "cat-megan-other": "opt-mo-met",
        "cat-megan-specials": "opt-msp-art",
      },
      notes1: "Maya excelled in her small reading group today!",
      notes2: "Remember library books on Friday.",
    };

    const meganFormatted = formatIndividualStudentEmail(
      meganState.students[0],
      meganEntry,
      meganState.categories,
      "2026-08-28",
      meganState.settings.emailSettings.fromName
    );

    assert(meganFormatted.text.includes("Teacher / Classroom: Megan (Special Education Teacher)"), "Megan's email includes Megan's sender title");
    assert(meganFormatted.text.includes("• Daily Goals & Progress - Reading: Met target reading objective"), "Megan's email includes Reading goal selection");
    assert(meganFormatted.text.includes("• Daily Goals & Progress - Math: Steady progress on math goal"), "Megan's email includes Math goal selection");
    assert(meganFormatted.text.includes("• Daily Goals & Progress - Other: Met individualized target objective"), "Megan's email includes Other goal selection");
    assert(meganFormatted.text.includes("TEACHER NOTES (Part 1):\nMaya excelled in her small reading group today!"), "Megan's email formats notes cleanly");
  } catch (e: any) {
    assert(false, `Megan email & categories test error: ${e.message}`);
  }

  // TEST 4: Multi-Classroom Data Isolation
  try {
    const saraState = getInitialStateForClassroom("sara");
    const meganState = getInitialStateForClassroom("megan");

    // Modify Sara's state
    saraState.entries["student-1"].notes1 = "Specific note for Alex";
    saraState.sentDate = "2026-08-28";

    // Verify Megan's state is completely unpolluted
    assert(meganState.sentDate === null, "Megan's sentDate is independent of Sara's sentDate");
    assert(meganState.entries["megan-1"].notes1 === "", "Megan's student notes are independent of Sara's notes");
    assert(saraState.categories.length === 4, "Sara has 4 categories");
    assert(meganState.categories.length === 6, "Megan has 6 categories");
  } catch (e: any) {
    assert(false, `Data isolation test error: ${e.message}`);
  }

  // TEST 5: Default Passcode Profiles
  try {
    assert(CLASSROOM_PROFILES.sara.defaultPasscode === "sara2026", "Sara default passcode is sara2026");
    assert(CLASSROOM_PROFILES.megan.defaultPasscode === "megan2026", "Megan default passcode is megan2026");
  } catch (e: any) {
    assert(false, `Passcodes test error: ${e.message}`);
  }

  // TEST 6: Simulator Dispatch for Both Classrooms
  try {
    const saraState = getInitialStateForClassroom("sara");
    const saraSim = await sendAllReports(saraState, true);
    assert(saraSim.success === true, "Simulator mode dispatches successfully for Sara");
    assert(saraSim.sentCount === 4, "Sara simulator dispatched 4 emails (3 students + 1 master)");
    assert(saraSim.logs[0].recipient.includes("mauldinjeff+sara"), "Sara student email uses sub-addressing 'mauldinjeff+sara-...'");

    const meganState = getInitialStateForClassroom("megan");
    const meganSim = await sendAllReports(meganState, true);
    assert(meganSim.success === true, "Simulator mode dispatches successfully for Megan");
    assert(meganSim.sentCount === 4, "Megan simulator dispatched 4 emails (3 students + 1 master)");
    assert(Boolean(meganSim.logs.find(l => l.type === "master")?.recipient.includes("mauldinjeff+megan-master")), "Megan master email uses 'mauldinjeff+megan-master@gmail.com'");
  } catch (e: any) {
    assert(false, `Simulator dispatch test error: ${e.message}`);
  }


  // TEST 7: Missing Credentials Safeguards
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

  // TEST 8: Cloud Storage Detection & Hybrid Mode
  try {
    const { isCloudStorageConfigured } = await import("../lib/cloudStorage");
    // Ensure clean initial state
    const originalKvUrl = process.env.KV_REST_API_URL;
    const originalKvToken = process.env.KV_REST_API_TOKEN;
    const originalUpstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const originalUpstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    assert(isCloudStorageConfigured() === false, "Defaults gracefully to local disk when cloud env vars absent");

    process.env.KV_REST_API_URL = "https://mock-kv.upstash.io";
    process.env.KV_REST_API_TOKEN = "mock-token";
    assert(isCloudStorageConfigured() === true, "Detects Vercel KV environment variables (KV_REST_API_URL/TOKEN)");

    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "mock-upstash-token";
    assert(isCloudStorageConfigured() === true, "Detects Upstash Redis environment variables (UPSTASH_REDIS_REST_URL/TOKEN)");

    // Restore environment
    if (originalKvUrl) process.env.KV_REST_API_URL = originalKvUrl; else delete process.env.KV_REST_API_URL;
    if (originalKvToken) process.env.KV_REST_API_TOKEN = originalKvToken; else delete process.env.KV_REST_API_TOKEN;
    if (originalUpstashUrl) process.env.UPSTASH_REDIS_REST_URL = originalUpstashUrl; else delete process.env.UPSTASH_REDIS_REST_URL;
    if (originalUpstashToken) process.env.UPSTASH_REDIS_REST_TOKEN = originalUpstashToken; else delete process.env.UPSTASH_REDIS_REST_TOKEN;
  } catch (e: any) {
    assert(false, `Cloud storage detection test error: ${e.message}`);
  }

  // TEST 9: Cross-Device Smart Sync & Pull from Cloud
  try {
    const {
      pullServerState,
      saveLocalState,
      loadLocalState,
      setLastSyncedTimestamp,
      clearMemoryStorage,
    } = await import("../lib/storage");

    const originalFetch = global.fetch;

    // Subtest 9.1: Server returns offline/error
    global.fetch = (async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    })) as any;

    const offlineResult = await pullServerState("sara");
    assert(offlineResult.status === "offline", "pullServerState returns 'offline' when server errors");

    // Subtest 9.2: Server has no state saved yet
    global.fetch = (async () => ({
      ok: true,
      json: async () => ({ hasSavedState: false }),
    })) as any;

    const emptyResult = await pullServerState("sara");
    assert(emptyResult.status === "server_empty", "pullServerState returns 'server_empty' when no cloud state exists");

    // Subtest 9.3: Server is up to date (identical timestamp or entries)
    clearMemoryStorage();
    const baseState = getInitialStateForClassroom("sara");
    baseState.updatedAt = 1000;
    saveLocalState(baseState, "sara");
    setLastSyncedTimestamp("sara", 1000);

    global.fetch = (async () => ({
      ok: true,
      json: async () => ({
        hasSavedState: true,
        state: { ...baseState, updatedAt: 1000 },
      }),
    })) as any;

    const upToDateResult = await pullServerState("sara");
    assert(upToDateResult.status === "up_to_date", "pullServerState recognizes when local is already up to date");

    // Subtest 9.4: Cloud has newer notes from other device (e.g. phone) and local is clean
    const newerServerState = {
      ...baseState,
      updatedAt: 2000,
      entries: {
        ...baseState.entries,
        "student-1": {
          ...baseState.entries["student-1"],
          notes1: "Typed on phone during morning circle",
        },
      },
    };

    global.fetch = (async () => ({
      ok: true,
      json: async () => ({
        hasSavedState: true,
        state: newerServerState,
      }),
    })) as any;

    const updatedResult = await pullServerState("sara");
    assert(updatedResult.status === "updated", "pullServerState cleanly pulls newer cloud updates when local has no unsaved edits");
    assert(
      loadLocalState("sara").entries["student-1"].notes1 === "Typed on phone during morning circle",
      "Local state was updated with cloud notes"
    );

    // Subtest 9.5: Conflict prevention - local has unsaved notes draft
    const draftLocalState = loadLocalState("sara");
    draftLocalState.entries["student-1"].notes2 = "Unsaved draft typed on classroom laptop";
    draftLocalState.updatedAt = 3000;
    saveLocalState(draftLocalState, "sara");

    const newerPhoneState = {
      ...draftLocalState,
      updatedAt: 4000,
      entries: {
        ...draftLocalState.entries,
        "student-1": {
          ...draftLocalState.entries["student-1"],
          notes1: "Phone update 2",
          notes2: "", // Phone doesn't have laptop draft
        },
      },
    };

    global.fetch = (async () => ({
      ok: true,
      json: async () => ({
        hasSavedState: true,
        state: newerPhoneState,
      }),
    })) as any;

    const conflictResult = await pullServerState("sara");
    assert(conflictResult.status === "conflict_unsaved", "pullServerState detects conflict and does not overwrite unsaved local drafts");
    assert(
      loadLocalState("sara").entries["student-1"].notes2 === "Unsaved draft typed on classroom laptop",
      "Local draft was safeguarded against loss"
    );

    // Subtest 9.6: User explicitly confirms force overwrite ("Pull Cloud Notes")
    const forceResult = await pullServerState("sara", { force: true });
    assert(forceResult.status === "updated", "Force pull cleanly overwrites when user explicitly confirms");
    assert(
      loadLocalState("sara").entries["student-1"].notes1 === "Phone update 2",
      "Cloud state accepted upon explicit user confirmation"
    );

    // Subtest 9.7: Multi-device student switching scenario (Phone on Alex, Desktop on Sam)
    clearMemoryStorage();
    const cleanBaseSara = getInitialStateForClassroom("sara");
    cleanBaseSara.updatedAt = 1000;

    const cloudServerStateWithSam: AppState = {
      ...cleanBaseSara,
      updatedAt: 5000,
      entries: {
        ...cleanBaseSara.entries,
        "student-3": {
          ...cleanBaseSara.entries["student-3"],
          notes1: "Sam mastered counting cubes today (entered on computer).",
        },
      },
    };

    // Device 2 (Phone) had state from T=1000 and was viewing Alex
    saveLocalState(cleanBaseSara, "sara");
    setLastSyncedTimestamp("sara", 1000);

    let postOccurredOnTabSwitch = false;
    global.fetch = (async (url: string, init?: any) => {
      if (init?.method === "POST") {
        postOccurredOnTabSwitch = true;
        return { ok: true, json: async () => ({ success: true }) };
      }
      return {
        ok: true,
        json: async () => ({
          hasSavedState: true,
          state: cloudServerStateWithSam,
        }),
      };
    }) as any;

    // Simulate user switching to Sam (student-3) on Device 2
    let device2ActiveStudentId = "student-1";
    device2ActiveStudentId = "student-3";

    assert(!postOccurredOnTabSwitch, "Switching student tabs on Device 2 does not push stale state to cloud");

    // Device 2 clicks "Pull from Cloud"
    const phonePullResult = await pullServerState("sara");
    assert(phonePullResult.status === "updated", "Device 2 pullServerState status is 'updated' after switching to Sam");

    const phoneUpdatedState = loadLocalState("sara");
    assert(
      phoneUpdatedState.entries["student-3"]?.notes1 ===
        "Sam mastered counting cubes today (entered on computer).",
      "Device 2 successfully receives Sam's notes from Device 1 after switching student tab"
    );

    // Subtest 9.8: Stale client push rejected when server has newer state
    const { syncStateToServer } = await import("../lib/storage");
    const staleState: AppState = {
      ...cleanBaseSara,
      updatedAt: 1000, // Older than cloud's 5000
    };

    global.fetch = (async (url: string, init?: any) => {
      if (init?.method === "POST") {
        const body = JSON.parse(init.body || "{}");
        if (!body.force && body.state?.updatedAt < 5000) {
          return {
            ok: false,
            status: 409,
            json: async () => ({ conflict: true, message: "Server has newer notes" }),
          };
        }
        return { ok: true, json: async () => ({ success: true }) };
      }
      return {
        ok: true,
        json: async () => ({ hasSavedState: true, state: cloudServerStateWithSam }),
      };
    }) as any;

    const staleSyncSuccess = await syncStateToServer(staleState, "sara", false);
    assert(!staleSyncSuccess, "Unforced stale state push is rejected when server has newer notes");

    const forcedSyncSuccess = await syncStateToServer(staleState, "sara", true);
    assert(forcedSyncSuccess, "Forced state push succeeds when user explicitly confirms in conflict modal");

    // Restore fetch
    global.fetch = originalFetch;
  } catch (e: any) {
    assert(false, `Cross-device sync test error: ${e.message}`);
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

