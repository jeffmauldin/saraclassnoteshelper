"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { StudentTabs } from "@/components/StudentTabs";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import { NotesSection } from "@/components/NotesSection";
import { ActionPanel } from "@/components/ActionPanel";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  initialAppState,
  createDefaultEntries,
  getTodayDateString,
} from "@/lib/initialData";
import {
  loadLocalState,
  saveLocalState,
  fetchServerState,
  syncStateToServer,
  clearAuthSession,
} from "@/lib/storage";
import { AppState, SendResult } from "@/lib/types";
import { formatIndividualStudentEmail, formatMasterSummaryEmail } from "@/lib/emailFormatter";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function DailyDashboardPage() {
  return (
    <AuthGuard>
      <DailyDashboardContent />
    </AuthGuard>
  );
}

function DailyDashboardContent() {
  const [state, setState] = useState<AppState>(initialAppState);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<"saved" | "unsaved" | "syncing" | "error">("saved");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showSendModal, setShowSendModal] = useState(false);
  const [showResendWarningModal, setShowResendWarningModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load initial data on mount
  useEffect(() => {
    const local = loadLocalState();
    const today = getTodayDateString();

    // If date changed since last session, update currentDate
    const initialState = {
      ...local,
      currentDate: today,
    };
    setState(initialState);
    if (initialState.students.length > 0) {
      setSelectedStudentId(initialState.students[0].id);
    }

    // Attempt server sync
    setSyncStatus("syncing");
    fetchServerState()
      .then((serverState) => {
        if (serverState) {
          setState({
            ...serverState,
            currentDate: today,
          });
          if (serverState.students.length > 0) {
            setSelectedStudentId(serverState.students[0].id);
          }
          setSyncStatus("saved");
        } else {
          setSyncStatus("saved");
        }
      })
      .catch(() => setSyncStatus("saved"));
  }, []);

  // Update selected student when students list changes
  useEffect(() => {
    if (state.students.length > 0 && (!selectedStudentId || !state.students.find((s) => s.id === selectedStudentId))) {
      setSelectedStudentId(state.students[0].id);
    }
  }, [state.students, selectedStudentId]);

  // Handle local state changes (snappy 0ms updates)
  const updateStateLocally = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveLocalState(next);
      setSyncStatus("unsaved");
      return next;
    });
  }, []);

  // Manual or automatic cloud sync
  const triggerSync = async () => {
    setSyncStatus("syncing");
    const ok = await syncStateToServer(state);
    if (ok) {
      setSyncStatus("saved");
      showToast("All changes saved to cloud!");
    } else {
      setSyncStatus("error");
      showToast("Saved locally (cloud sync offline)");
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    window.location.reload();
  };

  // Current active student
  const activeStudent =
    state.students.find((s) => s.id === selectedStudentId) ||
    state.students[0] || {
      id: "unknown",
      name: "Student",
      emails: [],
    };

  const activeEntry = state.entries[activeStudent.id] || {
    studentId: activeStudent.id,
    selections: {},
    notes1: "",
    notes2: "",
  };

  // Update category selection for current student
  const handleCategoryChange = (categoryId: string, optionId: string) => {
    updateStateLocally((prev) => {
      const studentEntry = prev.entries[activeStudent.id] || {
        studentId: activeStudent.id,
        selections: {},
        notes1: "",
        notes2: "",
      };

      return {
        ...prev,
        entries: {
          ...prev.entries,
          [activeStudent.id]: {
            ...studentEntry,
            selections: {
              ...studentEntry.selections,
              [categoryId]: optionId,
            },
          },
        },
      };
    });
  };

  // Update notes
  const handleNotes1Change = (val: string) => {
    updateStateLocally((prev) => {
      const studentEntry = prev.entries[activeStudent.id] || {
        studentId: activeStudent.id,
        selections: {},
        notes1: "",
        notes2: "",
      };
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [activeStudent.id]: {
            ...studentEntry,
            notes1: val,
          },
        },
      };
    });
  };

  const handleNotes2Change = (val: string) => {
    updateStateLocally((prev) => {
      const studentEntry = prev.entries[activeStudent.id] || {
        studentId: activeStudent.id,
        selections: {},
        notes1: "",
        notes2: "",
      };
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [activeStudent.id]: {
            ...studentEntry,
            notes2: val,
          },
        },
      };
    });
  };

  // Send Email Click Handler
  const handleSendClick = () => {
    const isAlreadySent = state.sentDate === state.currentDate;
    if (isAlreadySent) {
      setShowResendWarningModal(true);
    } else {
      setShowSendModal(true);
    }
  };

  // Execute Email Send
  const executeSend = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });

      const result: SendResult = await res.json();
      if (result.success) {
        // Mark as sent today
        const updated = {
          ...state,
          sentDate: state.currentDate,
        };
        setState(updated);
        saveLocalState(updated);
        syncStateToServer(updated);
        setSyncStatus("saved");

        setShowSendModal(false);
        setShowResendWarningModal(false);
        showToast(result.message || `Successfully sent ${result.sentCount} reports!`);
      } else {
        alert(`Sending Notice: ${result.message}`);
      }
    } catch (e: any) {
      alert(`Network error during email dispatch: ${e.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Execute Reset for Next Day
  const executeReset = () => {
    const defaultEntries = createDefaultEntries(state.students, state.categories);
    const updated: AppState = {
      ...state,
      entries: defaultEntries,
      sentDate: null,
      lastResetDate: getTodayDateString(),
    };
    setState(updated);
    saveLocalState(updated);
    syncStateToServer(updated);
    setSyncStatus("saved");
    setShowResetModal(false);
    showToast("Classroom entries reset for next day!");
  };

  return (
    <div className="min-h-screen flex flex-col pb-12">
      {/* Navigation Header */}
      <Navbar
        currentDate={state.currentDate}
        syncStatus={syncStatus}
        onManualSync={triggerSync}
        onLogout={handleLogout}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl border border-gray-800 flex items-center space-x-2 animate-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Container */}
      <main className="max-w-6xl w-full mx-auto px-4 pt-4 space-y-4 flex-1">
        {/* Student Selector Bar */}
        <StudentTabs
          students={state.students}
          selectedStudentId={selectedStudentId}
          onSelectStudent={(id) => {
            setSelectedStudentId(id);
            // Background save/sync when switching students
            syncStateToServer(state);
          }}
          entries={state.entries}
        />

        {/* Active Student Header Banner */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold tracking-wider text-sky-200">
                Recording Report For
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{activeStudent.name}</h2>
            <p className="text-xs text-sky-100 mt-0.5">
              {activeStudent.parentNames ? `${activeStudent.parentNames} • ` : ""}
              {activeStudent.emails?.length > 0
                ? activeStudent.emails.join(", ")
                : "⚠️ No parent email configured (Set in Settings)"}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              {state.categories.length} Categories Active
            </span>
          </div>
        </div>

        {/* Category Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
          {state.categories.map((cat) => (
            <CategoryDropdown
              key={cat.id}
              category={cat}
              selectedOptionId={activeEntry.selections[cat.id]}
              onChange={handleCategoryChange}
            />
          ))}
        </div>

        {/* Notes 1 & Notes 2 (with Voice Dictation) */}
        <NotesSection
          notes1={activeEntry.notes1}
          notes2={activeEntry.notes2}
          onChangeNotes1={handleNotes1Change}
          onChangeNotes2={handleNotes2Change}
        />

        {/* Actions & Safeguards */}
        <ActionPanel
          sentDate={state.sentDate}
          currentDate={state.currentDate}
          isSending={isSending}
          selectedStudent={activeStudent}
          selectedEntry={activeEntry}
          categories={state.categories}
          fromName={state.settings.emailSettings.fromName}
          onSendClick={handleSendClick}
          onResetClick={() => setShowResetModal(true)}
        />
      </main>

      {/* MODAL 1: Send All Reports Confirmation */}
      <ConfirmModal
        isOpen={showSendModal}
        title="Send All Daily Email Reports?"
        message="This will send individual plain text emails to parents/guardians for each student, plus a consolidated master summary to Sara."
        confirmText="Yes, Send All Reports"
        variant="primary"
        isProcessing={isSending}
        details={
          <div className="space-y-1.5">
            <p className="font-bold text-gray-800">Dispatch Summary:</p>
            <p>• {state.students.length} individual student emails</p>
            <p>• 1 Master summary to: {state.settings.emailSettings.masterRecipients.join(", ")}</p>
            <p>• Provider: <span className="font-mono font-semibold uppercase">{state.settings.emailSettings.provider}</span></p>
          </div>
        }
        onConfirm={executeSend}
        onCancel={() => setShowSendModal(false)}
      />

      {/* MODAL 2: Warning when reports were already sent today */}
      <ConfirmModal
        isOpen={showResendWarningModal}
        title="⚠️ Reports Already Sent Today"
        message="Daily reports have already been marked as sent for today. Are you sure you want to re-send all parent reports?"
        confirmText="Yes, Re-Send Emails"
        variant="warning"
        isProcessing={isSending}
        details={
          <p className="text-amber-800">
            Re-sending will dispatch another set of emails to all parent inboxes for today ({state.currentDate}).
          </p>
        }
        onConfirm={executeSend}
        onCancel={() => setShowResendWarningModal(false)}
      />

      {/* MODAL 3: Reset for Next Day Guard */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Reset All Entries for Next Day?"
        message="Are you sure you want to reset all students' dropdowns to defaults and clear Notes 1 & Notes 2?"
        confirmText="Yes, Reset Everything"
        variant="danger"
        details={
          <p className="text-rose-800">
            ⚠️ This will clear today&apos;s typed notes and restore all menu selections to their default &quot;No report&quot; states.
          </p>
        }
        onConfirm={executeReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
}
