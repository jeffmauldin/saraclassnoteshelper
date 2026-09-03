# AGENTS.md

Welcome! This document provides technical context, architecture guidelines, and operational procedures for AI agents (and human developers) maintaining and enhancing the **Sara's Classroom Daily Log & Parent Reporting System**.

---

## 🎯 System Overview

* **Primary User**: Sara, a special education teacher managing a small classroom (<10 students) with severe communication and behavioral needs.
* **Core Purpose**: Drastically reduce the daily administrative burden of creating, managing, and emailing daily student observation notes and parent reports.
* **Key Features**:
  1. Responsive, mobile-first and desktop-friendly web interface.
  2. Student selector (<10 students) with completion status indicators.
  3. Fully configurable dropdown categories (e.g., Breakfast, Rest/Nap, Behavior, Therapy) with customizable default options (e.g. "No report").
  4. Two separate arbitrary note textareas (**Notes 1** and **Notes 2**).
  5. Built-in **Voice Dictation** (via Web Speech API) for hands-free teacher notes.
  6. Multi-recipient plain-text email generation:
     - Formatted individual text-only emails for each student's parents/guardians.
     - Single consolidated master daily summary email for Sara (and admin/testers).
  7. Safeguards:
     - "Are you sure?" confirmation modals on both "Send Reports" and "Reset for Next Day".
     - Visual indicator displaying whether reports have already been sent today, warning against accidental re-sending.
     - "Reset for Next Day" restoring all dropdowns to default and clearing notes.
  8. 30-day passphrase session persistence on recognized devices.
  9. Zero-cost multi-provider sending (Google App Password SMTP, Brevo API, and Test Simulator Mode).

---

## 🏗️ Architecture & Technology Stack

* **Framework**: Next.js 14 (App Router) with TypeScript & React 18
* **Styling**: Tailwind CSS (mobile-first, high contrast, accessible)
* **Icons**: `lucide-react`
* **Email Dispatch**:
  - `nodemailer` for Gmail SMTP (using Google App Passwords)
  - Direct REST API for Brevo (Sendinblue)
  - Built-in dry-run simulator for zero-credential testing
* **Testing Framework**: `vitest`

---

## 📂 Key File Structure

```
/workspaces/AllVibesDemo/
├── AGENTS.md                  # This file
├── README.md                  # User instructions, GitHub setup, and transfer guide
├── package.json               # Dependencies & scripts
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Global layout & HTML head metadata
│   │   ├── page.tsx           # Main Daily Reporting Dashboard
│   │   ├── settings/page.tsx  # Configuration Manager (Students, Dropdowns, Emails, Security)
│   │   ├── preview/page.tsx   # Live Email Preview & Dry-Run Simulator
│   │   └── api/
│   │       ├── auth/route.ts  # 30-day passphrase authentication endpoint
│   │       ├── data/route.ts  # Cross-device synchronization & server storage
│   │       └── send/route.ts  # Email dispatch API
│   ├── components/
│   │   ├── Navbar.tsx         # Top bar with date, sync status, and navigation
│   │   ├── StudentTabs.tsx    # Mobile-friendly student selector pills
│   │   ├── CategoryDropdown.tsx # Dropdown with default indicator & quick chips
│   │   ├── NotesSection.tsx   # Notes 1 & 2 with Web Speech voice dictation
│   │   ├── ActionPanel.tsx    # Send button, Sent status banner, Reset button
│   │   ├── ConfirmModal.tsx   # Reusable safeguard confirmation popup
│   │   └── AuthGuard.tsx      # Passphrase gate with 30-day persistence
│   ├── lib/
│   │   ├── types.ts           # Core TypeScript types & data schemas
│   │   ├── initialData.ts     # Preconfigured 3 sample students and categories
│   │   ├── emailFormatter.ts  # Plain-text email generator with date stamps
│   │   ├── emailSender.ts     # Multi-provider email engine
│   │   ├── speech.ts          # Web Speech API helper
│   │   └── storage.ts         # Local-first client cache and sync engine
│   └── tests/
│       ├── emailFormatter.test.ts # Tests for individual & master emails
│       ├── state.test.ts          # Tests for reset and defaults
│       └── validation.test.ts     # Tests for email delivery safeguards
```

---

## 🔧 Useful Commands

```bash
# Run automated test suite
npm test

# Run tests in watch mode
npm run test:watch

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 🔒 Security & Data Principles

1. **Passphrase Access**: Authentication is handled via a lightweight passphrase token with a 30-day lifespan in `localStorage`.
2. **Plain-Text Emails**: All student emails are formatted strictly as plain text (no tracking pixels, no complex HTML) to ensure maximum deliverability, readability on all parent devices, and respect for student privacy.
3. **No Lock-In**: Configuration and student records are stored in a standard portable JSON structure. Deploying to Vercel, Netlify, Render, or transferring to Sara's GitHub account requires no proprietary database migrations.
