import { AppState, Category, ClassroomId, ClassroomProfile, Student } from "./types";

export const CLASSROOM_PROFILES: Record<ClassroomId, ClassroomProfile> = {
  sara: {
    id: "sara",
    name: "Sara's Classroom",
    teacherName: "Sara",
    icon: "☀️",
    themeColor: "sky",
    defaultPasscode: "sara2026",
    emailFromName: "Sara (Special Education Teacher)",
  },
  megan: {
    id: "megan",
    name: "Megan's Classroom",
    teacherName: "Megan",
    icon: "🌸",
    themeColor: "emerald",
    defaultPasscode: "megan2026",
    emailFromName: "Megan (Special Education Teacher)",
  },
};

export const initialSaraStudents: Student[] = [
  {
    id: "student-1",
    name: "Alex T.",
    parentNames: "Taylor Family (Demo)",
    emails: ["mauldinjeff+sara-alex@gmail.com"],
  },
  {
    id: "student-2",
    name: "Jordan M.",
    parentNames: "Miller Family (Demo)",
    emails: ["mauldinjeff+sara-jordan@gmail.com"],
  },
  {
    id: "student-3",
    name: "Sam K.",
    parentNames: "King Family (Demo)",
    emails: ["mauldinjeff+sara-sam@gmail.com"],
  },
];

export const initialSaraCategories: Category[] = [
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

export const initialMeganStudents: Student[] = [
  {
    id: "megan-1",
    name: "Maya L.",
    parentNames: "Long Family (Demo)",
    emails: ["mauldinjeff+megan-maya@gmail.com"],
  },
  {
    id: "megan-2",
    name: "Lucas R.",
    parentNames: "Rivera Family (Demo)",
    emails: ["mauldinjeff+megan-lucas@gmail.com"],
  },
  {
    id: "megan-3",
    name: "Emma W.",
    parentNames: "Watson Family (Demo)",
    emails: ["mauldinjeff+megan-emma@gmail.com"],
  },
];

export const initialMeganCategories: Category[] = [
  {
    id: "cat-megan-highlights",
    name: "Academic Highlights & Focus",
    defaultOptionId: "opt-mh-none",
    options: [
      { id: "opt-mh-none", label: "No report" },
      { id: "opt-mh-reading", label: "Reading & phonics comprehension" },
      { id: "opt-mh-math", label: "Math problem solving & calculations" },
      { id: "opt-mh-writing", label: "Creative writing & handwriting" },
      { id: "opt-mh-science", label: "Science & hands-on exploration" },
    ],
  },
  {
    id: "cat-megan-social",
    name: "Social & Group Participation",
    defaultOptionId: "opt-ms-none",
    options: [
      { id: "opt-ms-none", label: "No report" },
      { id: "opt-ms-coop", label: "Highly cooperative & helpful friend" },
      { id: "opt-ms-active", label: "Active contributor in discussions" },
      { id: "opt-ms-quiet", label: "Focused quietly on independent work" },
      { id: "opt-ms-encouraged", label: "Needed encouraging prompt to share" },
    ],
  },
  {
    id: "cat-megan-reading",
    name: "Daily Goals & Progress - Reading",
    defaultOptionId: "opt-mr-none",
    options: [
      { id: "opt-mr-none", label: "No report" },
      { id: "opt-mr-met", label: "Met target reading objective" },
      { id: "opt-mr-steady", label: "Steady progress on reading goal" },
      { id: "opt-mr-prompt", label: "Practiced reading with guided support" },
      { id: "opt-mr-foundational", label: "Reviewing foundational sight words/phonics" },
    ],
  },
  {
    id: "cat-megan-math",
    name: "Daily Goals & Progress - Math",
    defaultOptionId: "opt-mm-none",
    options: [
      { id: "opt-mm-none", label: "No report" },
      { id: "opt-mm-met", label: "Met target math objective" },
      { id: "opt-mm-steady", label: "Steady progress on math goal" },
      { id: "opt-mm-manip", label: "Practiced math with manipulatives" },
      { id: "opt-mm-foundational", label: "Reviewing foundational math skills" },
    ],
  },
  {
    id: "cat-megan-other",
    name: "Daily Goals & Progress - Other",
    defaultOptionId: "opt-mo-none",
    options: [
      { id: "opt-mo-none", label: "No report" },
      { id: "opt-mo-met", label: "Met individualized target objective" },
      { id: "opt-mo-steady", label: "Steady progress on individualized goal" },
      { id: "opt-mo-support", label: "Working with teacher assistance" },
      { id: "opt-mo-none-today", label: "Goal area not scheduled today" },
    ],
  },
  {
    id: "cat-megan-specials",
    name: "Special Activities",
    defaultOptionId: "opt-msp-none",
    options: [
      { id: "opt-msp-none", label: "No report" },
      { id: "opt-msp-art", label: "Art & Music class" },
      { id: "opt-msp-pe", label: "Physical Education / Recess" },
      { id: "opt-msp-library", label: "Library / Media time" },
      { id: "opt-msp-sensory", label: "Sensory & Free Choice" },
    ],
  },
];

export const initialStudents: Student[] = initialSaraStudents;
export const initialCategories: Category[] = initialSaraCategories;

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

export function getInitialStateForClassroom(classroomId: ClassroomId): AppState {
  const isSara = classroomId === "sara";
  const students = isSara ? initialSaraStudents : initialMeganStudents;
  const categories = isSara ? initialSaraCategories : initialMeganCategories;
  const profile = CLASSROOM_PROFILES[classroomId];

  return {
    classroomId,
    students,
    categories,
    entries: createDefaultEntries(students, categories),
    currentDate: getTodayDateString(),
    sentDate: null,
    lastResetDate: getTodayDateString(),
    updatedAt: 0,
    settings: {
      passphrase: profile.defaultPasscode,
      emailSettings: {
        provider: "simulator",
        gmailUser: "mauldinjeff@gmail.com",
        gmailAppPassword: "",
        brevoApiKey: "",
        fromName: profile.emailFromName,
        masterRecipients: [`mauldinjeff+${classroomId}-master@gmail.com`],
      },
    },
  };
}

export const initialAppState: AppState = getInitialStateForClassroom("sara");

