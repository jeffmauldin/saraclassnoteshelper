import { AppState, Category, Student } from "./types";

export const initialStudents: Student[] = [
  {
    id: "student-1",
    name: "Alex T.",
    parentNames: "Taylor Family (Demo)",
    emails: ["mauldinjeff+alex@gmail.com"],
  },
  {
    id: "student-2",
    name: "Jordan M.",
    parentNames: "Miller Family (Demo)",
    emails: ["mauldinjeff+jordan@gmail.com"],
  },
  {
    id: "student-3",
    name: "Sam K.",
    parentNames: "King Family (Demo)",
    emails: ["mauldinjeff+sam@gmail.com"],
  },
];

export const initialCategories: Category[] = [
  {
    id: "cat-breakfast",
    name: "Breakfast Report",
    defaultOptionId: "opt-bk-none",
    options: [
      { id: "opt-bk-none", label: "No report" },
      { id: "opt-bk-all", label: "Ate all / ate well" },
      { id: "opt-bk-some", label: "Ate some food" },
      { id: "opt-bk-none-ate", label: "Did not eat" },
      { id: "opt-bk-refused", label: "Refused meal" },
    ],
  },
  {
    id: "cat-rest",
    name: "Rest / Nap Information",
    defaultOptionId: "opt-rest-none",
    options: [
      { id: "opt-rest-none", label: "No report" },
      { id: "opt-rest-nap", label: "Took a good nap" },
      { id: "opt-rest-quiet", label: "Rested quietly (no sleep)" },
      { id: "opt-rest-no", label: "Did not take nap" },
      { id: "opt-rest-restless", label: "Restless / needed soothing" },
    ],
  },
  {
    id: "cat-behavior",
    name: "Basic Behavior & Mood",
    defaultOptionId: "opt-beh-none",
    options: [
      { id: "opt-beh-none", label: "No report" },
      { id: "opt-beh-well", label: "Well behaved / happy & calm" },
      { id: "opt-beh-assist", label: "Cooperative with minor redirection" },
      { id: "opt-beh-uncoop", label: "Uncooperative / agitated" },
      { id: "opt-beh-hurt", label: "Hurt another student / physical incident" },
    ],
  },
  {
    id: "cat-therapy",
    name: "Sensory & Speech / Therapy",
    defaultOptionId: "opt-th-none",
    options: [
      { id: "opt-th-none", label: "No report" },
      { id: "opt-th-great", label: "Great session / fully engaged" },
      { id: "opt-th-break", label: "Sensory break requested and helpful" },
      { id: "opt-th-none-today", label: "No therapy scheduled today" },
    ],
  },
];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDefaultEntries(
  students: Student[],
  categories: Category[]
): Record<string, { studentId: string; selections: Record<string, string>; notes1: string; notes2: string }> {
  const entries: Record<string, { studentId: string; selections: Record<string, string>; notes1: string; notes2: string }> = {};

  for (const student of students) {
    const selections: Record<string, string> = {};
    for (const cat of categories) {
      selections[cat.id] = cat.defaultOptionId;
    }
    entries[student.id] = {
      studentId: student.id,
      selections,
      notes1: "",
      notes2: "",
    };
  }

  return entries;
}

export const initialAppState: AppState = {
  students: initialStudents,
  categories: initialCategories,
  entries: createDefaultEntries(initialStudents, initialCategories),
  currentDate: getTodayDateString(),
  sentDate: null,
  lastResetDate: getTodayDateString(),
  settings: {
    passphrase: "sara2026",
    emailSettings: {
      provider: "simulator",
      gmailUser: "mauldinjeff@gmail.com",
      gmailAppPassword: "",
      brevoApiKey: "",
      fromName: "Sara (Special Education Teacher)",
      masterRecipients: ["mauldinjeff@gmail.com"],
    },
  },
};
