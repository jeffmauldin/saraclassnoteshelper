# ☀️ Sara's Classroom Daily Log & Parent Reporting System

A lightweight, mobile-friendly and laptop-friendly daily reporting application built for special education teacher Sara. Designed to make recording daily observations and sending text-only email notes to parents effortless, fast, and 100% free.

---

## ✨ Features at a Glance

* **📱 Mobile & Laptop Ready**: Touch-friendly interface with large buttons and clean contrast.
* **👦 Fast Student Selector**: Quick tab selector for classroom students with completion badges.
* **📋 Customizable Categories**: Preconfigured dropdowns for Breakfast, Rest/Nap, Behavior, Therapy, etc., with easy-to-change defaults (like *"No report"*).
* **📝 Notes 1 & Notes 2 with Voice Dictation**: Two separate notes boxes with built-in voice-to-text dictation using your phone or laptop microphone.
* **✉️ 1-Click Automated Emails**:
  * Formatted text-only daily report sent to each student's parents/guardians.
  * Master consolidated summary report containing all students sent to Sara (and admin/testers).
* **🛡️ Safeguards & Warnings**:
  * **"Are you sure?"** confirmation modal before sending emails.
  * **Already Sent Today** status indicator warning against duplicate sends.
  * **"Reset for Next Day"** button (guarded by confirmation) to clear notes and restore defaults.
* **⚙️ Flexible Free Email Dispatch**:
  * **Google App Password**: Sends directly from your or Sara's Gmail account.
  * **Brevo API (Free Tier)**: 300 free emails/day.
  * **Test Simulator Mode**: Zero-setup preview and testing without sending real emails.
* **🔄 Cross-Device Synchronization**: Make changes on your laptop or phone; state stays synced with snappy 0ms instant local editing.
* **🔐 30-Day Passcode Persistence**: Simple passcode security that remembers your phone or laptop for 30 days.

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
Open [http://localhost:3000](http://localhost:3000) in your browser.

* **Default Passcode**: `sara2026` (you can customize this anytime in Settings).

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
   * Docker will build the container with Node.js LTS, Antigravity CLI (`agy`), and run `npm install` automatically.
   * Port `3000` is automatically forwarded to `http://localhost:3000`.
   * Start developing immediately:
     ```bash
     npm run dev
     ```


---

## 🧪 Testing the System (Fake Students Sandbox)

The app comes preloaded with **3 sample students**:
* **Alex T.** (`alex-parent-test@example.com`)
* **Jordan M.** (`jordan-parent-test@example.com`)
* **Sam K.** (`sam-parent-test@example.com`)

### How to test:
1. Open the app and log in with passcode `sara2026`.
2. Make some changes to the dropdowns, click **Voice Dictate** (or type) in **Notes 1** and **Notes 2**.
3. Click **"Email Preview"** in the top navigation bar to see the exact text emails generated for parents and the master summary.
4. Click **"Run Dry-Run Test"** to simulate the complete email dispatch flow.
5. Go back to the dashboard, click **"Send All Email Reports"** to test the confirmation guard and sent status indicators.
6. Test **"Reset for Next Day"** to verify that dropdowns revert to default and notes clear.

### Running Automated Unit Tests
```bash
npm test
```

---

## ⚙️ Setting Up Real Email Sending

When you are ready to send live emails:

### Option A: Using Gmail with Google App Password (Recommended)
1. Log into your Google Account and visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
2. Enter "Sara Daily Reports" as the app name and click **Create**.
3. Google will display a 16-letter password (e.g. `abcd efgh ijkl mnop`).
4. In the app, go to **Settings** → **Email Delivery Setup**:
   * Select **✉️ Gmail (App Password)**.
   * Enter your Gmail address and paste the 16-letter password.
   * Click **Save Changes**.
5. *Tip: You can test with your own Gmail first, and later switch it to Sara's Gmail!*

### Option B: Using Brevo (Free 300 emails/day)
1. Sign up for a free account at [brevo.com](https://www.brevo.com).
2. Grab your free API key under **SMTP & API**.
3. Paste the API key into **Settings** → **Email Delivery Setup**.

---

## 🚢 Free Hosting & Transferring to Sara's GitHub

This app is built with standard Next.js and has zero proprietary database locks.

### Deploying to Free Hosting (Vercel / Cloudflare Pages / Netlify / Render)
1. Push this repository to your GitHub account.
2. Go to [vercel.com](https://vercel.com) (or Cloudflare Pages), sign in with GitHub, and click **Add New Project**.
3. Select this repository and click **Deploy** (100% free tier).

### Transferring to Sara's GitHub Account
* Whenever you're ready, you can either:
  1. Transfer the GitHub repository directly to Sara's GitHub account via GitHub repository settings (**Settings** → **Danger Zone** → **Transfer ownership**).
  2. Or have Sara fork/clone the repo and deploy it to her own free Vercel account.

---

## 📄 License
MIT © 2026. Built with care for special education teachers and families.