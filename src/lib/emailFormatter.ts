import { AppState, Category, DailyStudentEntry, Student } from "./types";

export function formatFriendlyDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatIndividualStudentEmail(
  student: Student,
  entry: DailyStudentEntry | undefined,
  categories: Category[],
  dateStr: string,
  fromName: string
): { subject: string; text: string } {
  const friendlyDate = formatFriendlyDate(dateStr);
  const subject = `Daily Student Report: ${student.name} - ${dateStr}`;

  const lines: string[] = [
    `DAILY STUDENT REPORT`,
    `Date: ${friendlyDate}`,
    `Student: ${student.name}${student.parentNames ? ` (${student.parentNames})` : ""}`,
    `Teacher / Classroom: ${fromName}`,
    `========================================`,
    ``,
    `DAILY OBSERVATIONS:`,
  ];

  for (const cat of categories) {
    const selectedOptionId = entry?.selections[cat.id] || cat.defaultOptionId;
    const option = cat.options.find((o) => o.id === selectedOptionId);
    const optionLabel = option ? option.label : "No report";
    lines.push(`• ${cat.name}: ${optionLabel}`);
  }

  lines.push(``);

  const notes1 = entry?.notes1?.trim();
  if (notes1) {
    lines.push(`TEACHER NOTES (Part 1):`);
    lines.push(notes1);
    lines.push(``);
  }

  const notes2 = entry?.notes2?.trim();
  if (notes2) {
    lines.push(`ADDITIONAL NOTES (Part 2):`);
    lines.push(notes2);
    lines.push(``);
  }

  if (!notes1 && !notes2) {
    lines.push(`ADDITIONAL NOTES:`);
    lines.push(`(None recorded for today)`);
    lines.push(``);
  }

  lines.push(`========================================`);
  lines.push(`Please feel free to reply directly to this email if you have any questions.`);
  lines.push(`Have a wonderful evening!`);

  return {
    subject,
    text: lines.join("\n"),
  };
}

export function formatMasterSummaryEmail(
  state: AppState,
  dateStr: string
): { subject: string; text: string } {
  const friendlyDate = formatFriendlyDate(dateStr);
  const studentCount = state.students.length;
  const subject = `Master Classroom Daily Summary - ${dateStr} (${studentCount} Students)`;

  const lines: string[] = [
    `MASTER CLASSROOM DAILY SUMMARY REPORT`,
    `Date: ${friendlyDate}`,
    `Total Students: ${studentCount}`,
    `Sender: ${state.settings.emailSettings.fromName}`,
    `================================================================`,
    ``,
  ];

  for (let i = 0; i < state.students.length; i++) {
    const student = state.students[i];
    const entry = state.entries[student.id];

    lines.push(`----------------------------------------------------------------`);
    lines.push(`[${i + 1}/${studentCount}] STUDENT: ${student.name}`);
    if (student.emails && student.emails.length > 0) {
      lines.push(`Parent Contacts: ${student.emails.join(", ")}`);
    }
    lines.push(`----------------------------------------------------------------`);

    for (const cat of state.categories) {
      const selectedOptionId = entry?.selections[cat.id] || cat.defaultOptionId;
      const option = cat.options.find((o) => o.id === selectedOptionId);
      const optionLabel = option ? option.label : "No report";
      lines.push(`• ${cat.name}: ${optionLabel}`);
    }

    lines.push(``);

    const notes1 = entry?.notes1?.trim();
    if (notes1) {
      lines.push(`Notes 1: ${notes1}`);
    }

    const notes2 = entry?.notes2?.trim();
    if (notes2) {
      lines.push(`Notes 2: ${notes2}`);
    }

    if (!notes1 && !notes2) {
      lines.push(`Notes: (None recorded)`);
    }

    lines.push(``);
  }

  lines.push(`================================================================`);
  lines.push(`End of Daily Classroom Master Report.`);

  return {
    subject,
    text: lines.join("\n"),
  };
}
