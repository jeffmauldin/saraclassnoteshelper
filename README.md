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
* **🔄 Cross-Device Synchronization**: Make changes on your laptop or phone; state stays synced with snappy 0ms instant local editing.
* **🔐 Role-Based Passcodes & 30-Day Persistence**: Dedicated teacher logins and an Admin master mode with 30-day "Remember this device" persistence.

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
Runs 44 automated assertions covering email generation, multi-classroom state isolation, cloud storage detection, and safeguard validation.

---

## ⚙️ Setting Up Real Email Sending

When you are ready to send live emails:

### Option A: Using Gmail with Google App Password (Recommended)
1. Log into your Google Account and visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
2. Enter a name like "Class Daily Reports" and click **Create**.
3. Google will display a 16-letter password (e.g. `abcd efgh ijkl mnop`).
4. In the app, go to **Settings** → **Email Delivery Setup**:
   * Select **✉️ Gmail (App Password)**.
   * Enter your Gmail address and paste the 16-letter password.
   * Click **Save Changes**.
5. *Tip: You can test with your own Gmail first, and later switch it to Sara's or Megan's Gmail!*

### Option B: Using Brevo (Free 300 emails/day)
1. Sign up for a free account at [brevo.com](https://www.brevo.com).
2. Grab your free API key under **SMTP & API**.
3. Paste the API key into **Settings** → **Email Delivery Setup**.

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