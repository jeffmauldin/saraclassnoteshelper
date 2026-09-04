# AGENTS.md

Welcome! This document provides technical context, architecture guidelines, and operational procedures for AI agents (and human developers) maintaining and enhancing the **Classroom Daily Log & Parent Reporting System** for special education teachers **Sara** and **Megan**.

---

## 🎯 System Overview

* **Primary Users**:
  * **Sara**: Special education teacher managing a classroom with severe communication and behavioral needs.
  * **Megan**: Special education teacher managing a classroom focusing on academic progress, social participation, and IEP goals.
  * **Admin**: Observer / administrator who can manage both classrooms seamlessly.
* **Core Purpose**: Drastically reduce the daily administrative burden of creating, managing, and emailing daily student observation notes and parent reports.
* **Key Features**:
  1. **Multi-Classroom Support**: Independent data profiles, students, categories, and settings for each teacher (`sara` and `megan`).
  2. **Role-Based Authentication**:
     - `sara2026` unlocks Sara's classroom directly.
     - `megan2026` unlocks Megan's classroom directly.
     - `admin2026` unlocks both with an instant switcher dropdown in the navbar.
     - 30-day session persistence stored securely in browser `localStorage`.
  3. **Responsive Web Interface**: Large touch targets, high contrast, mobile and desktop friendly.
  4. **Student Selector**: Fast student selector tabs with completion badges and contact count indicators.
  5. **Configurable Categories**:
     - **Sara**: Breakfast Report, Rest / Nap, Basic Behavior & Mood, Sensory & Speech / Therapy, Lunch Report.
     - **Megan**: Academic Highlights & Focus, Social & Group Participation, Daily Goals & Progress (Reading, Math, Other), Special Activities.
     - Dynamic defaults (e.g. *"No report"*) and one-tap quick chips.
  6. **Notes 1 & Notes 2 with Voice Dictation**: Two arbitrary textareas featuring Web Speech API voice dictation.
  7. **Multi-Recipient Plain-Text Email Generation**:
     - Formatted individual text-only emails for each student's parents/guardians.
     - Consolidated master daily summary email for the teacher and admin/testers.
     - Sub-addressing testing format (`mauldinjeff+sara-...@gmail.com` and `mauldinjeff+megan-...@gmail.com`).
  8. **Safeguards**:
     - Confirmation modals before sending reports and resetting for the next day.
     - "Already Sent Today" banner to prevent accidental duplicate dispatches.
     - "Reset for Next Day" restoring all dropdowns to default and clearing notes.
  9. **Zero-Cost Email Sending**: Google App Password SMTP, Brevo API, and Test Simulator Mode.

---

## 🏗️ Architecture & Technology Stack

* **Framework**: Next.js 14 (App Router) with TypeScript & React 18
* **Styling**: Tailwind CSS (mobile-first, high contrast, accessible)
* **Icons**: `lucide-react`
* **Email Dispatch**:
  - `nodemailer` for Gmail SMTP (using Google App Passwords)
  - Direct REST API for Brevo (Sendinblue)
  - Built-in dry-run simulator for zero-credential testing
* **Testing Framework**: `tsx` test runner with Vitest-compatible assertions (`src/tests/testSuite.ts`)

---

## 📂 Key File Structure

```
/workspaces/saraclassnoteshelper/
├── AGENTS.md                  # This file - technical architecture and agent guide
├── README.md                  # User instructions, Docker/devcontainer, and transfer guide
├── WALKTHROUGH.md             # Functional verification and system walkthrough
├── package.json               # Dependencies & scripts
├── .data/
│   ├── app_state.json         # Legacy / baseline state
│   ├── state_sara.json        # Sara's classroom state (auto-created/synced)
│   └── state_megan.json       # Megan's classroom state (auto-created/synced)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Global layout & HTML head metadata
│   │   ├── page.tsx           # Main Daily Reporting Dashboard
│   │   ├── settings/page.tsx  # Configuration Manager (Students, Dropdowns, Emails, Security)
│   │   ├── preview/page.tsx   # Live Email Preview & Dry-Run Simulator
│   │   └── api/
│   │       ├── auth/route.ts  # Role-based passcode authentication (sara / megan / admin)
│   │       ├── data/route.ts  # Per-classroom cloud sync & server storage
│   │       └── send/route.ts  # Email dispatch API (simulator / gmail / brevo)
│   ├── components/
│   │   ├── Navbar.tsx         # Top bar with date, sync status, and Admin classroom switcher
│   │   ├── StudentTabs.tsx    # Mobile-friendly student selector pills
│   │   ├── CategoryDropdown.tsx # Dropdown with default indicator & quick chips
│   │   ├── NotesSection.tsx   # Notes 1 & 2 with Web Speech voice dictation
│   │   ├── ActionPanel.tsx    # Send button, Sent status banner, Reset button
│   │   ├── ConfirmModal.tsx   # Reusable safeguard confirmation popup
│   │   └── AuthGuard.tsx      # Passcode gate with classroom tabs and 30-day persistence
│   ├── lib/
│   │   ├── types.ts           # Core TypeScript types (ClassroomId, UserRole, AppState)
│   │   ├── initialData.ts     # Preconfigured students & categories for Sara and Megan
│   │   ├── cloudStorage.ts    # Cloud KV storage adapter (Upstash / Vercel KV) with disk fallback
│   │   ├── emailFormatter.ts  # Plain-text email generator with date stamps
│   │   ├── emailSender.ts     # Multi-provider email engine
│   │   ├── speech.ts          # Web Speech API helper
│   │   └── storage.ts         # Local-first client cache and sync engine
│   └── tests/
│       ├── testSuite.ts       # Main test suite (44 assertions covering classrooms & cloud storage)
│       ├── emailFormatter.test.ts # Tests for individual & master emails
│       ├── state.test.ts      # Tests for reset and defaults
│       └── validation.test.ts # Tests for email delivery safeguards
```

---

## 🔧 Useful Commands

```bash
# Run automated test suite (44 assertions)
npm test

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 🔒 Security & Data Principles

1. **Passcode Access**: Authentication is handled via role-based tokens (`sara`, `megan`, or `admin`) with a 30-day lifespan in `localStorage`.
2. **Plain-Text Emails**: All student emails are formatted strictly as plain text (no tracking pixels, no complex HTML) to ensure maximum deliverability, readability on all parent devices, and respect for student privacy.
3. **Multi-Classroom State Isolation**: State is scoped strictly per classroom (`state_sara.json` vs `state_megan.json`). Actions taken in one classroom (such as resetting for the next day or sending emails) never affect the other classroom.
4. **No Lock-In**: Configuration and student records are stored in portable JSON structures. Deploying to Vercel, Netlify, Render, or transferring to Sara's or Megan's GitHub account requires no proprietary database migrations.
