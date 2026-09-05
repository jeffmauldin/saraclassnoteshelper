# Walkthrough: Classroom Daily Log & Parent Reporting System (Sara & Megan)

The **Classroom Daily Log & Parent Reporting System** has been built, tested, and validated for both **Sara's Classroom** and **Megan's Classroom**. It delivers a fast, mobile-friendly and laptop-friendly web application for special education teachers to log daily student observations, customize dropdowns and emails, and send plain-text reports with zero hosting costs.

---

## 🎯 What Was Built

### 1. 🏫 Multi-Classroom Architecture & Profiles
- **☀️ Sara's Classroom Profile**:
  - Focus: Severe communication, behavioral support, and sensory needs.
  - Categories: Breakfast Report, Rest / Nap Information, Basic Behavior & Mood, Sensory & Speech / Therapy, Lunch Report.
  - Default Passcode: `sara2026`
- **🌸 Megan's Classroom Profile**:
  - Focus: Academic progress, social interaction, and individual IEP objectives.
  - Categories: Academic Highlights & Focus, Social & Group Participation, Daily Goals & Progress (Reading, Math, Other), Special Activities.
  - Default Passcode: `megan2026`
- **🛡️ Admin Master Mode**:
  - Passcode: `admin2026`
  - Allows an administrator or observer to switch between Sara's and Megan's classrooms directly from the top navigation dropdown without having to log out.

### 2. 📱 Responsive Daily Dashboard (`src/app/page.tsx`)
- **Fast Student Selector**: Touch-friendly student selector pills (<10 students) displaying contact counts and note completion badges.
- **Dynamic Category Dropdowns**: Contextual categories with customizable default values (e.g. *"No report"*) and one-tap quick selection pills.
- **Notes 1 & Notes 2 with Voice Dictation**: Two separate notes textareas featuring built-in **Voice Dictation** (browser Web Speech API).
- **Instant 0ms Local-First Editing**: All dropdown and text changes update immediately in browser memory with zero network delay.
- **Cross-Device Smart Sync & Pull Cloud**:
  - **"Pull Cloud" Button**: Explicit downward-sync button in the top navbar to pull down notes recorded on a phone or another device on demand.
  - **Bandwidth-Friendly Tab Resume**: Automatically checks for updates when switching back to the dashboard tab (`visibilitychange` / focus) throttled to 60+ seconds of idle time without battery-draining polling.
  - **Local Draft Conflict Protection**: If unsaved notes are typed locally and newer notes arrive from the cloud, a dedicated `ConflictModal` prompts the teacher to choose between pulling cloud notes or keeping the local draft.
- **Cross-Device Cloud Sync**: Automatic background synchronization with server storage (`/api/data`), plus manual push/pull controls in the navigation bar.

### 3. 🛡️ Safeguards & Actions (`src/components/ActionPanel.tsx`, `ConfirmModal.tsx`)
- **"Send All Email Reports" Button**:
  - Guarded by an **"Are you sure?"** confirmation modal with a live summary of recipients.
  - **"Already Sent Today" Banner**: Visual warning if reports were already dispatched today, preventing accidental duplicate sending while allowing override if confirmed.
- **"Reset for Next Day" Button**:
  - Guarded by an **"Are you sure?"** confirmation modal.
  - Reverts all dropdown items to their defaults (e.g. *"No report"*) and clears Notes 1 & Notes 2.
- **"Open in Phone Mail App" Backup**:
  - One-tap `mailto:` link opening the phone's native Gmail or Apple Mail app with the student's report pre-filled for zero-credential sending.

### 4. ⚙️ Settings & Configuration Manager (`src/app/settings/page.tsx`)
- **Student Manager**: Add, edit, and delete students, parent/guardian names, and recipient email addresses.
- **Dropdown Manager**: Add/remove categories, add/remove options, and choose default selections.
- **Email Delivery Setup**: Switch seamlessly between:
  - **🧪 Test Simulator Mode** (zero credentials needed)
  - **✉️ Gmail App Password** (starts with test password, easily swapped to Sara's or Megan's)
  - **⚡ Brevo API** (free 300 emails/day)
  - **Master Summary Recipients List** (teacher + testing emails).
- **Security**: Custom passcode configuration with **30-day "Remember this device"** persistence.

### 5. 👁️ Email Preview & Dry-Run Simulator (`src/app/preview/page.tsx`)
- Live preview showing the exact plain-text emails generated for each individual student and the master daily summary.
- **"Run Dry-Run Test"** button to simulate the complete email dispatch flow.

---

## 🧪 Verification & Automated Test Results

The test suite in [`src/tests/testSuite.ts`](file:///workspaces/saraclassnoteshelper/src/tests/testSuite.ts) was executed and passed with **100% success (53/53 assertions)**:

```text
========================================================
 🧪 SARA & MEGAN CLASSROOM SYSTEM - TEST SUITE
========================================================

  ✅ PASS: Date formats to human readable string (e.g. August 28, 2026)
  ✅ PASS: Subject line matches 'Daily Student Report: Alex T. - 2026-08-28'
  ✅ PASS: Email contains main header
  ✅ PASS: Email includes student name
  ✅ PASS: Email includes Sara's sender name
  ✅ PASS: Email correctly includes Breakfast selection
  ✅ PASS: Email correctly includes Rest selection
  ✅ PASS: Email correctly includes Behavior selection
  ✅ PASS: Email formats Notes 1 accurately
  ✅ PASS: Email formats Notes 2 accurately
  ✅ PASS: Megan classroom initialized with 3 students
  ✅ PASS: Megan student #1 is Maya L.
  ✅ PASS: Maya's email has sub-address tag 'mauldinjeff+megan-maya@gmail.com'
  ✅ PASS: Megan's sender name configured properly
  ✅ PASS: Megan categories include 'Academic Highlights & Focus'
  ✅ PASS: Megan categories include 'Social & Group Participation'
  ✅ PASS: Megan categories include 'Daily Goals & Progress - Reading'
  ✅ PASS: Megan categories include 'Daily Goals & Progress - Math'
  ✅ PASS: Megan categories include 'Daily Goals & Progress - Other'
  ✅ PASS: Megan categories include 'Special Activities'
  ✅ PASS: Megan's email includes Megan's sender title
  ✅ PASS: Megan's email includes Reading goal selection
  ✅ PASS: Megan's email includes Math goal selection
  ✅ PASS: Megan's email includes Other goal selection
  ✅ PASS: Megan's email formats notes cleanly
  ✅ PASS: Megan's sentDate is independent of Sara's sentDate
  ✅ PASS: Megan's student notes are independent of Sara's notes
  ✅ PASS: Sara has 4 categories
  ✅ PASS: Megan has 6 categories
  ✅ PASS: Sara default passcode is sara2026
  ✅ PASS: Megan default passcode is megan2026
  ✅ PASS: Simulator mode dispatches successfully for Sara
  ✅ PASS: Sara simulator dispatched 4 emails (3 students + 1 master)
  ✅ PASS: Sara student email uses sub-addressing 'mauldinjeff+sara-...'
  ✅ PASS: Simulator mode dispatches successfully for Megan
  ✅ PASS: Megan simulator dispatched 4 emails (3 students + 1 master)
  ✅ PASS: Megan master email uses 'mauldinjeff+megan-master@gmail.com'
  ✅ PASS: Missing Gmail credentials properly blocked dispatch
  ✅ PASS: Safeguard returned helpful instruction to set Gmail credentials
  ✅ PASS: Missing Brevo API key properly blocked dispatch
  ✅ PASS: Safeguard returned helpful instruction to set Brevo API key
  ✅ PASS: Defaults gracefully to local disk when cloud env vars absent
  ✅ PASS: Detects Vercel KV environment variables (KV_REST_API_URL/TOKEN)
  ✅ PASS: Detects Upstash Redis environment variables (UPSTASH_REDIS_REST_URL/TOKEN)
  ✅ PASS: pullServerState returns 'offline' when server errors
  ✅ PASS: pullServerState returns 'server_empty' when no cloud state exists
  ✅ PASS: pullServerState recognizes when local is already up to date
  ✅ PASS: pullServerState cleanly pulls newer cloud updates when local has no unsaved edits
  ✅ PASS: Local state was updated with cloud notes
  ✅ PASS: pullServerState detects conflict and does not overwrite unsaved local drafts
  ✅ PASS: Local draft was safeguarded against loss
  ✅ PASS: Force pull cleanly overwrites when user explicitly confirms
  ✅ PASS: Cloud state accepted upon explicit user confirmation

========================================================
 📊 FINAL RESULTS: 53 PASSED, 0 FAILED
========================================================
```

---

## 🚀 How to Try the App Right Now

1. **Start the App**:
   ```bash
   npm run dev
   ```
2. **Open the browser** at `http://localhost:3000`.
3. **Log in**:
   - For Sara's Classroom: use passcode `sara2026`
   - For Megan's Classroom: use passcode `megan2026`
   - For Admin (both classrooms): use passcode `admin2026`
4. **Try out the preloaded demo students**:
   - Select students in either classroom.
   - Adjust dropdowns and dictate or type notes in **Notes 1** and **Notes 2**.
   - Tap **Email Preview** to inspect plain-text parent reports and master summary.
   - Tap **Send All Email Reports** (or test in Simulator mode).
   - Tap **Reset for Next Day** to test the next-day clearing guard.
