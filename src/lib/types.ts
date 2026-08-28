export interface Student {
  id: string;
  name: string;
  parentNames?: string;
  emails: string[];
}

export interface CategoryOption {
  id: string;
  label: string;
}

export interface Category {
  id: string;
  name: string;
  options: CategoryOption[];
  defaultOptionId: string;
}

export interface DailyStudentEntry {
  studentId: string;
  selections: Record<string, string>; // categoryId -> optionId or optionLabel
  notes1: string;
  notes2: string;
}

export type EmailProviderType = "simulator" | "gmail" | "brevo";

export interface EmailSettings {
  provider: EmailProviderType;
  gmailUser: string;
  gmailAppPassword?: string;
  brevoApiKey?: string;
  fromName: string;
  masterRecipients: string[];
}

export interface AppSettings {
  passphrase: string;
  emailSettings: EmailSettings;
}

export interface AppState {
  students: Student[];
  categories: Category[];
  entries: Record<string, DailyStudentEntry>; // studentId -> DailyStudentEntry
  currentDate: string; // YYYY-MM-DD
  sentDate: string | null; // Date when emails were last sent
  lastResetDate: string | null;
  settings: AppSettings;
}

export interface SendResult {
  success: boolean;
  message: string;
  sentCount: number;
  logs: {
    recipient: string;
    studentName?: string;
    type: "individual" | "master";
    status: "sent" | "simulated" | "failed";
    previewBody: string;
    error?: string;
  }[];
}
