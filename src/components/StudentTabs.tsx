"use client";

import React from "react";
import { Student, DailyStudentEntry } from "@/lib/types";
import { User, CheckCircle, Mail } from "lucide-react";

interface StudentTabsProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  entries: Record<string, DailyStudentEntry>;
}

export function StudentTabs({
  students,
  selectedStudentId,
  onSelectStudent,
  entries,
}: StudentTabsProps) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Students ({students.length})
        </span>
        <span className="text-xs text-gray-400">
          Tap student to record notes
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {students.map((student) => {
          const isSelected = student.id === selectedStudentId;
          const entry = entries[student.id];
          const hasNotes = Boolean(entry?.notes1?.trim() || entry?.notes2?.trim());
          const hasEmails = Boolean(student.emails && student.emails.length > 0);

          return (
            <button
              key={student.id}
              onClick={() => onSelectStudent(student.id)}
              className={`flex flex-col items-start p-3 rounded-xl text-left border transition relative ${
                isSelected
                  ? "bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-300"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center space-x-1.5 font-semibold text-sm">
                  <User className={`w-4 h-4 ${isSelected ? "text-sky-100" : "text-gray-400"}`} />
                  <span className="truncate">{student.name}</span>
                </div>
                {hasNotes && (
                  <CheckCircle
                    className={`w-3.5 h-3.5 ${
                      isSelected ? "text-emerald-300" : "text-emerald-500"
                    }`}
                  />
                )}
              </div>

              <div className="flex items-center space-x-1 text-xs opacity-80 truncate w-full">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {hasEmails ? `${student.emails.length} contact` : "No email"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
