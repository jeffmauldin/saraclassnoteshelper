import nodemailer from "nodemailer";
import { AppState, SendResult } from "./types";
import { formatIndividualStudentEmail, formatMasterSummaryEmail } from "./emailFormatter";

export async function sendAllReports(
  state: AppState,
  forceSimulator: boolean = false
): Promise<SendResult> {
  const dateStr = state.currentDate;
  const settings = state.settings.emailSettings;
  const provider = forceSimulator ? "simulator" : settings.provider;

  const logs: SendResult["logs"] = [];
  let sentCount = 0;

  // 1. Prepare individual emails for each student
  const studentEmails: {
    studentName: string;
    recipients: string[];
    subject: string;
    text: string;
  }[] = [];

  for (const student of state.students) {
    if (!student.emails || student.emails.length === 0) continue;
    const entry = state.entries[student.id];
    const { subject, text } = formatIndividualStudentEmail(
      student,
      entry,
      state.categories,
      dateStr,
      settings.fromName
    );
    studentEmails.push({
      studentName: student.name,
      recipients: student.emails,
      subject,
      text,
    });
  }

  // 2. Prepare master summary email
  const masterSummary = formatMasterSummaryEmail(state, dateStr);
  const masterRecipients = settings.masterRecipients || [];

  // 3. Dispatch according to provider
  if (provider === "simulator") {
    // Simulated sending
    for (const item of studentEmails) {
      for (const recipient of item.recipients) {
        logs.push({
          recipient,
          studentName: item.studentName,
          type: "individual",
          status: "simulated",
          previewBody: item.text,
        });
        sentCount++;
      }
    }

    for (const recipient of masterRecipients) {
      logs.push({
        recipient,
        type: "master",
        status: "simulated",
        previewBody: masterSummary.text,
      });
      sentCount++;
    }

    return {
      success: true,
      message: `Simulation complete: ${sentCount} email(s) prepared for delivery.`,
      sentCount,
      logs,
    };
  }

  if (provider === "gmail") {
    if (!settings.gmailUser || !settings.gmailAppPassword) {
      return {
        success: false,
        message: "Gmail configuration missing: Please set Gmail address and Google App Password in Settings.",
        sentCount: 0,
        logs: [],
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: settings.gmailUser,
        pass: settings.gmailAppPassword.replace(/\s+/g, ""), // clean spaces in app password
      },
    });

    // Send individual student reports
    for (const item of studentEmails) {
      for (const recipient of item.recipients) {
        try {
          await transporter.sendMail({
            from: `"${settings.fromName}" <${settings.gmailUser}>`,
            to: recipient,
            subject: item.subject,
            text: item.text,
          });
          logs.push({
            recipient,
            studentName: item.studentName,
            type: "individual",
            status: "sent",
            previewBody: item.text,
          });
          sentCount++;
        } catch (err: any) {
          logs.push({
            recipient,
            studentName: item.studentName,
            type: "individual",
            status: "failed",
            previewBody: item.text,
            error: err.message || "Failed to send email via Gmail",
          });
        }
      }
    }

    // Send master summary
    for (const recipient of masterRecipients) {
      try {
        await transporter.sendMail({
          from: `"${settings.fromName}" <${settings.gmailUser}>`,
          to: recipient,
          subject: masterSummary.subject,
          text: masterSummary.text,
        });
        logs.push({
          recipient,
          type: "master",
          status: "sent",
          previewBody: masterSummary.text,
        });
        sentCount++;
      } catch (err: any) {
        logs.push({
          recipient,
          type: "master",
          status: "failed",
          previewBody: masterSummary.text,
          error: err.message || "Failed to send master email via Gmail",
        });
      }
    }

    const anyFailed = logs.some((l) => l.status === "failed");
    return {
      success: !anyFailed,
      message: anyFailed
        ? `Sent ${sentCount} emails, but some failed. Check delivery logs.`
        : `Successfully sent all ${sentCount} reports via Gmail!`,
      sentCount,
      logs,
    };
  }

  if (provider === "brevo") {
    if (!settings.brevoApiKey) {
      return {
        success: false,
        message: "Brevo API Key missing: Please enter your Brevo API key in Settings.",
        sentCount: 0,
        logs: [],
      };
    }

    const senderEmail = settings.gmailUser || "reports@school.org";

    // Send individual student reports via Brevo API
    for (const item of studentEmails) {
      for (const recipient of item.recipients) {
        try {
          const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": settings.brevoApiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sender: { name: settings.fromName, email: senderEmail },
              to: [{ email: recipient }],
              subject: item.subject,
              textContent: item.text,
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || `Brevo HTTP ${res.status}`);
          }

          logs.push({
            recipient,
            studentName: item.studentName,
            type: "individual",
            status: "sent",
            previewBody: item.text,
          });
          sentCount++;
        } catch (err: any) {
          logs.push({
            recipient,
            studentName: item.studentName,
            type: "individual",
            status: "failed",
            previewBody: item.text,
            error: err.message || "Brevo delivery error",
          });
        }
      }
    }

    // Send master summary
    for (const recipient of masterRecipients) {
      try {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": settings.brevoApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: settings.fromName, email: senderEmail },
            to: [{ email: recipient }],
            subject: masterSummary.subject,
            textContent: masterSummary.text,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Brevo HTTP ${res.status}`);
        }

        logs.push({
          recipient,
          type: "master",
          status: "sent",
          previewBody: masterSummary.text,
        });
        sentCount++;
      } catch (err: any) {
        logs.push({
          recipient,
          type: "master",
          status: "failed",
          previewBody: masterSummary.text,
          error: err.message || "Brevo delivery error",
        });
      }
    }

    const anyFailed = logs.some((l) => l.status === "failed");
    return {
      success: !anyFailed,
      message: anyFailed
        ? `Sent ${sentCount} emails, but some failed. Check delivery logs.`
        : `Successfully sent all ${sentCount} reports via Brevo API!`,
      sentCount,
      logs,
    };
  }

  return {
    success: false,
    message: "Unknown email provider selected.",
    sentCount: 0,
    logs: [],
  };
}
