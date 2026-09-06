"use client";

import React from "react";
import { Send, RotateCcw, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { Student, DailyStudentEntry, Category } from "@/lib/types";
import { formatIndividualStudentEmail } from "@/lib/emailFormatter";

interface ActionPanelProps {
  sentDate: string | null;
  currentDate: string;
  isSending: boolean;
  selectedStudent: Student;
  selectedEntry?: DailyStudentEntry;
  categories: Category[];
  fromName: string;
  onSendClick: () => void;
  onResetClick: () => void;
}

export function ActionPanel({
  sentDate,
  currentDate,
  isSending,
  selectedStudent,
  selectedEntry,
  categories,
  fromName,
  onSendClick,
  onResetClick,
}: ActionPanelProps) {
  const isAlreadySentToday = sentDate === currentDate;

  // Build mailto link for quick phone sending
  const mailtoData = formatIndividualStudentEmail(
    selectedStudent,
    selectedEntry,
    categories,
    currentDate,
    fromName
  );
  const primaryRecipient = selectedStudent.emails?.[0] || "";
  const mailtoHref = `mailto:${encodeURIComponent(primaryRecipient)}?subject=${encodeURIComponent(
    mailtoData.subject
  )}&body=${encodeURIComponent(mailtoData.text)}`;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      {/* Sent Status Banner */}
      <div
        className={`p-3.5 rounded-2xl flex items-center justify-between border transition ${
          isAlreadySentToday
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
            : "bg-gray-50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200"
        }`}
      >
        <div className="flex items-center space-x-2.5">
          {isAlreadySentToday ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-gray-400 dark:text-slate-400 flex-shrink-0" />
          )}
          <div>
            <p className="text-xs font-bold">
              {isAlreadySentToday
                ? "Reports Already Sent Today"
                : "Reports Not Yet Sent Today"}
            </p>
            <p className="text-[11px] opacity-80">
              {isAlreadySentToday
                ? "Individual student emails and master summary have been dispatched."
                : "Complete daily notes and click 'Send Email Reports' when ready."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Send Email Reports Button */}
        <button
          type="button"
          onClick={onSendClick}
          disabled={isSending}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 ${
            isAlreadySentToday
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-sky-600 hover:bg-sky-700 text-white"
          } ${isSending ? "opacity-75 cursor-not-allowed" : ""}`}
        >
          {isSending ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          <span>
            {isAlreadySentToday
              ? "Re-Send Email Reports"
              : "Send All Email Reports"}
          </span>
        </button>

        {/* Reset for Next Day Button */}
        <button
          type="button"
          onClick={onResetClick}
          className="w-full py-3.5 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 text-gray-700 dark:text-slate-200 font-bold text-sm rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 transition flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-5 h-5 text-gray-500 dark:text-slate-400 group-hover:text-rose-600" />
          <span>Reset for Next Day</span>
        </button>
      </div>

      {/* Quick Phone Mail App Backup Option */}
      <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        <span>Phone backup:</span>
        <a
          href={mailtoHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold flex items-center space-x-1 hover:underline"
        >
          <span>Open {selectedStudent.name}&apos;s email in Phone Mail App</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
