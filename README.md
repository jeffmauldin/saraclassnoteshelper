# ☀️ Classroom Daily Log & Parent Reporting System (Sara & Megan)

A lightweight, mobile-friendly and laptop-friendly daily reporting application built for special education teachers **Sara** and **Megan**. Designed to make recording daily observations and sending text-only email notes to parents effortless, fast, and 100% free.

---

## ✨ Features at a Glance

* **🏫 Multi-Classroom Support**: Independent dashboards, student rosters, and categories for both **Sara's Classroom** (severe communication & behavioral needs) and **Megan's Classroom** (academic progress & IEP goals).
* **📱 Mobile & Laptop Ready**: Touch-friendly interface with large buttons and clean contrast for busy classroom environments.
* **👦 Fast Student Selector**: Quick tab selector for classroom students with completion badges.
* **📋 Customizable Categories**:
  * **Sara**: Breakfast, Rest/Nap, Behavior, Therapy, Lunch Report.
  * **Megan**: Academic Highlights, Social Participation, Reading Goals, Math Goals, Other IEP Goals, Special Activities.
  * Easy-to-change defaults (e.g. *"No report"*) and one-tap quick chips.
* **📝 Notes 1 & Notes 2 with Voice Dictation**: Two separate arbitrary notes boxes with built-in voice-to-text dictation using your phone or laptop microphone.
* **✉️ 1-Click Automated Plain-Text Emails**:
  * Formatted text-only daily report sent to each student's parents/guardians.
  * Master consolidated summary report containing all students sent to teacher (and admin/testers).
* **🛡️ Safeguards & Warnings**:
  * **"Are you sure?"** confirmation modal before sending emails with a live preview of recipients.
  * **Already Sent Today** status indicator warning against duplicate sends.
  * **"Reset for Next Day"** button (guarded by confirmation) to clear notes and restore defaults.
* **⚙️ Flexible Free Email Dispatch**:
  * **Google App Password**: Sends directly from your or the teacher's Gmail account.
  * **Brevo API (Free Tier)**: 300 free emails/day.
  * **Test Simulator Mode**: Zero-setup preview and testing without sending real emails.
* **🔄 Cross-Device Smart Sync & Pull**: Make changes on your laptop or phone; state stays synced with snappy 0ms instant local editing, a dedicated "Pull Cloud" button in the header, smart tab-resume auto-check (zero battery-draining polling), and draft conflict safeguards.
* **🔐 Role-Based Passcodes & 30-Day Persistence**: Dedicated teacher logins and an Admin master mode with 30-day "Remember this device" persistence.
* **🎨 Dark / Light Mode & Eye-Friendly Ergonomics**: 1-tap navbar theme toggle, Settings theme manager (System/Light/Dark), zero-flash native dropdown controls, and an anti-glare color palette (Slate Blue, Sage Green, Warm Bronze, and Terracotta) tuned to eliminate eye fatigue.

---

## 🔑 Passcodes & Access

| Role / Classroom | Passcode | Access Scope |
| :--- | :--- | :--- |
| ☀️ **Sara's Classroom** | `sara2026` | Opens Sara's daily log dashboard directly |
| 🌸 **Megan's Classroom** | `megan2026` | Opens Megan's daily log dashboard directly |
| 🛡️ **Admin Master** | `admin2026` | Unlocks both classrooms with on-the-fly switching in the top navigation bar |

*(Passcodes can also be customized at any time in **Settings**).*

---

## 🚀 Quick Start (Running Locally)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser and enter one of the passcodes above.

---

## 🐳 Developing with Docker Desktop & VS Code (Dev Containers)

If you are developing on a machine with **Docker Desktop** and **VS Code**:

1. **Prerequisites**:
   * Make sure **Docker Desktop** is installed and running.
   * In VS Code, install the **Dev Containers** extension (`ms-vscode-remote.remote-containers`).

2. **Clone and Open**:
   ```bash
   git clone https://github.com/jeffmauldin/saraclassnoteshelper.git
   cd saraclassnoteshelper
   code .
   ```

3. **Reopen in Container**:
   * VS Code will automatically detect the configuration and show a notification:  
     *"Folder contains a Dev Container configuration file. Reopen in Container"*.
   * Click **Reopen in Container** (or press `Ctrl+Shift+P` / `Cmd+Shift+P` and choose **Dev Containers: Reopen in Container**).

4. **Automatic Setup**:
   * Docker builds the container with Node.js LTS, Antigravity CLI (`agy`), and installs dependencies automatically.
   * Port `3000` is forwarded to `http://localhost:3000`.
   * Start developing:
     ```bash
     npm run dev
     ```

---

## 🧪 Testing the Classrooms (Demo Rosters & Sub-Addressing)

Each classroom comes pre-loaded with demo students configured with **Gmail sub-addressing** (`+tag`) so all test reports route safely to a single inbox during testing without bothering real parents.

### ☀️ Sara's Demo Classroom
* **Passcode**: `sara2026`
* **Students**:
  * **Alex T.** (`mauldinjeff+sara-alex@gmail.com`)
  * **Jordan M.** (`mauldinjeff+sara-jordan@gmail.com`)
  * **Sam K.** (`mauldinjeff+sara-sam@gmail.com`)
* **Master Summary**: `mauldinjeff+sara-master@gmail.com`

### 🌸 Megan's Demo Classroom
* **Passcode**: `megan2026`
* **Students**:
  * **Maya L.** (`mauldinjeff+megan-maya@gmail.com`)
  * **Lucas R.** (`mauldinjeff+megan-lucas@gmail.com`)
  * **Emma W.** (`mauldinjeff+megan-emma@gmail.com`)
* **Master Summary**: `mauldinjeff+megan-master@gmail.com`

### How to test:
1. Open the app and log in with passcode `admin2026` (or `sara2026` / `megan2026`).
2. Make some changes to the dropdowns, click **Voice Dictate** (or type) in **Notes 1** and **Notes 2**.
3. Click **"Email Preview"** in the top navigation bar to see the exact text emails generated for parents and the master summary.
4. Click **"Run Dry-Run Test"** to simulate the complete email dispatch flow.
5. On the dashboard, click **"Send All Email Reports"** to test the confirmation guard and sent status indicators.
6. Test **"Reset for Next Day"** to verify that dropdowns revert to defaults and notes clear.
7. Switch between classrooms from the navbar dropdown if logged in as Admin.

### Running Automated Tests
```bash
npm test
```
Runs 58 automated assertions covering email generation, multi-classroom state isolation, cross-device smart sync, local conflict safeguards, cloud storage detection, and safeguard validation.

---

## 📧 Step-by-Step Guide: Setting Up Google App Password for Sara (or Megan)

This section provides complete, friendly instructions for generating a secure Google 16-letter App Password and entering it into the website. You can share this section directly with Sara or walk her through it.

### Why Is an "App Password" Required?
Google does not allow third-party web apps to use your personal Gmail login password. Instead, Google provides an **App Password**—a dedicated 16-letter code that grants secure permission for the Classroom Notes app to send daily parent emails on your behalf without exposing your real password.

---

### Part 1: Generate the 16-Letter App Password in Google

> **Prerequisite**: Your Google Account must have **2-Step Verification** enabled. If you haven't turned it on yet, visit [myaccount.google.com/signinoptions/two-step-verification](https://myaccount.google.com/signinoptions/two-step-verification) and follow the prompts.

1. In your browser, go to:
   👉 **[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)**
   *(If prompted, sign in with the Gmail account you want to send reports from).*
2. Under **"App name"**, type a descriptive label such as:
   `Classroom Notes`
3. Click the blue **Create** button.
4. Google will display a popup with:
   **"Generated app password"** containing a **16-letter code** in a yellow box (formatted in 4 groups of 4 letters, e.g. `abcd efgh ijkl mnop`).
5. **Copy this 16-letter code** or write it down.
   *(Note: Google only displays this code once. If you ever close the window or lose it, you can delete it and generate a new one at any time).*
6. Click **Done**.

---

### Part 2: Add the App Password to the Website Setup

1. Open the Classroom Notes website on your phone, tablet, or computer.
2. Enter your classroom passcode (`sara2026` for Sara, `megan2026` for Megan, or `admin2026`).
3. Click or tap the **Settings** gear icon (⚙️) in the top navigation bar.
4. In the Settings tabs, select **Email Delivery Setup** (✉️ Mail icon).
5. Under **Email Sending Method**, select the **✉️ Gmail (App Password)** card.
   *(Note: The password field only appears when Gmail is selected).*
6. Fill in the fields:
   * **Teacher / Sender Display Name**: Enter what parents will see as the sender (e.g. `Sara (Special Education Teacher)`).
   * **Gmail Address**: Enter your full Gmail address (e.g. `sara.teacher@gmail.com`).
   * **Google 16-Letter App Password**: Paste the 16-letter code from Part 1 (the system automatically removes spaces, so `abcd efgh ijkl mnop` works directly).
   * **Master Daily Summary Recipients**: Enter your email address (and any assistants or testers) so you receive the consolidated daily summary each afternoon.
7. Click the blue **Save Changes** button at the top right of the Settings page.

---

### Part 3: Verify with a Quick Test
1. Return to the main dashboard by clicking **Back to Dashboard** (or the title in the navbar).
2. Click **Email Preview** in the top navigation bar to verify your sender name and recipient emails.
3. On the dashboard, fill out notes or select quick chips for a student.
4. Click **Send All Email Reports** and confirm the preview modal.
5. Check your Gmail inbox—the reports will arrive within seconds!

---

## ⚙️ Alternative Email Sending Providers

### Option B: Using Brevo (Free 300 emails/day)
1. Sign up for a free account at [brevo.com](https://www.brevo.com).
2. Grab your free API key under **SMTP & API**.
3. Paste the API key into **Settings** → **Email Delivery Setup** under the **⚡ Brevo API** option.


---

## 🚢 Free 1-Click Hosting on Vercel (Recommended)

This app is built with standard Next.js and has zero proprietary database locks.

### Deploying to Vercel (100% Free Forever)
1. **Import to Vercel**:
   * Sign in to [vercel.com](https://vercel.com) using your GitHub account.
   * Click **"Add New..."** → **"Project"**.
   * Select `saraclassnoteshelper` and click **Deploy**.
2. **Connect Free Cloud Storage for Cross-Device Sync**:
   * In your new Vercel project dashboard, click the **Storage** tab.
   * Click **"Create Database"** and select **Upstash Redis** (or KV).
   * Click **Connect to Project** and accept the defaults.
   * *That's it!* Vercel automatically populates the `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables.
   * Redeploy once, and teachers' notes will sync across phones, laptops, and home computers with 0ms lag.

### Transferring Ownership to Sara or Megan
* When ready, you can transfer the GitHub repository directly to Sara or Megan via repository settings (**Settings** → **Danger Zone** → **Transfer ownership**), or have them fork/clone and deploy to their own free hosting account.

---

## 📄 License
MIT © 2026. Built with care for special education teachers and families.