"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AuthGuard, useSession } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { StudentTabs } from "@/components/StudentTabs";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import { NotesSection } from "@/components/NotesSection";
import { ActionPanel } from "@/components/ActionPanel";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ConflictModal } from "@/components/ConflictModal";
import {
  getInitialStateForClassroom,
  createDefaultEntries,
  getTodayDateString,
  CLASSROOM_PROFILES,
} from "@/lib/initialData";
import {
  loadLocalState,
  saveLocalState,
  fetchServerState,
  syncStateToServer,
  syncStateToServerDetailed,
  pullServerState,
} from "@/lib/storage";
import { AppState, SendResult } from "@/lib/types";
import { CheckCircle } from "lucide-react";

export default function DailyDashboardPage() {
  return (
    <AuthGuard>
      <DailyDashboardContent />
    </AuthGuard>
  );
}

function DailyDashboardContent() {
  const { session, activeClassroomId, switchClassroom, logout } = useSession();
  const [state, setState] = useState<AppState>(() => {
    if (typeof window !== "undefined") {
      return loadLocalState(activeClassroomId);
    }
    return getInitialStateForClassroom(activeClassroomId);
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const local = loadLocalState(activeClassroomId);
      return local.students[0]?.id || "";
    }
    return getInitialStateForClassroom(activeClassroomId).students[0]?.id || "";
  });
  const [syncStatus, setSyncStatus] = useState<"saved" | "unsaved" | "syncing" | "error">("saved");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showSendModal, setShowSendModal] = useState(false);
  const [showResendWarningModal, setShowResendWarningModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const classroomProfile = CLASSROOM_PROFILES[activeClassroomId] || CLASSROOM_PROFILES.sara;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load classroom data whenever activeClassroomId changes
  useEffect(() => {
    const local = loadLocalState(activeClassroomId);
    const today = getTodayDateString();

    const initialState: AppState = {
      ...local,
      classroomId: activeClassroomId,
      currentDate: today,
    };
    setState(initialState);
    if (initialState.students.length > 0) {
      setSelectedStudentId((prev) =>
        initialState.students.some((s) => s.id === prev) ? prev : initialState.students[0].id
      );
    } else {
      setSelectedStudentId("");
    }

    setSyncStatus("syncing");
    fetchServerState(activeClassroomId)
      .then((serverState) => {
        if (serverState) {
          setState({
            ...serverState,
            classroomId: activeClassroomId,
            currentDate: today,
          });
          if (serverState.students.length > 0) {
            setSelectedStudentId((prev) =>
              serverState.students.some((s) => s.id === prev) ? prev : serverState.students[0].id
            );
          }
          setSyncStatus("saved");
        } else {
          setSyncStatus("saved");
        }
      })
      .catch(() => setSyncStatus("saved"));
  }, [activeClassroomId]);

  // Update selected student when students list changes
  useEffect(() => {
    if (state.students.length > 0 && (!selectedStudentId || !state.students.find((s) => s.id === selectedStudentId))) {
      setSelectedStudentId(state.students[0].id);
    }
  }, [state.students, selectedStudentId]);

  // Handle local state changes (snappy 0ms updates)
  const updateStateLocally = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setState((prev) => {
        const next = updater(prev);
        const withTimestamp: AppState = {
          ...next,
          updatedAt: Date.now(),
        };
        saveLocalState(withTimestamp, activeClassroomId);
        setSyncStatus("unsaved");
        return withTimestamp;
      });
    },
    [activeClassroomId]
  );

  // Manual pull from cloud
  const handleManualPull = async (force = false) => {
    setIsPulling(true);
    try {
      const res = await pullServerState(activeClassroomId, {
        force,
        hasLocalUnsaved: syncStatus === "unsaved",
      });

      if (res.status === "updated" && res.serverState) {
        setState({
          ...res.serverState,
          classroomId: activeClassroomId,
          currentDate: state.currentDate,
        });
        setSyncStatus("saved");
        setShowConflictModal(false);
        showToast(res.message || "Loaded latest notes from cloud!");
      } else if (res.status === "up_to_date") {
        setSyncStatus("saved");
        showToast(res.message || "Already up to date with cloud.");
      } else if (res.status === "conflict_unsaved") {
        setShowConflictModal(true);
      } else if (res.status === "server_empty") {
        showToast("No cloud notes found yet for this classroom.");
      } else if (res.status === "offline") {
        showToast("Could not reach cloud (offline).");
      }
    } catch {
      showToast("Failed to pull from cloud.");
    } finally {
      setIsPulling(false);
    }
  };

  // Manual or automatic cloud sync
  const triggerSync = async (force = false) => {
    setSyncStatus("syncing");
    const res = await syncStateToServerDetailed(state, activeClassroomId, force);
    if (res.success) {
      setSyncStatus("saved");
      showToast("All changes saved to cloud!");
    } else if (res.conflict) {
      // Newer notes exist in the cloud from another device
      if (syncStatus !== "unsaved") {
        // Safe to pull: no unsaved local drafts on this screen
        await handleManualPull(false);
      } else {
        // Unsaved local drafts exist: show ConflictModal to let teacher choose
        setShowConflictModal(true);
      }
    } else if (res.offline) {
      setSyncStatus("error");
      showToast("Could not reach cloud (offline). Notes saved locally.");
    } else {
      setSyncStatus("error");
      showToast(res.message || "Could not save to cloud.");
    }
  };

  // Bandwidth-friendly Smart Tab Resume: Auto-check cloud when switching back to tab
  useEffect(() => {
    let lastCheckTime = Date.now();

    const handleTabResume = async () => {
      if (typeof document === "undefined" || document.visibilityState !== "visible") return;

      const now = Date.now();
      // Throttle to at most once every 60 seconds
      if (now - lastCheckTime < 60000) return;
      lastCheckTime = now;

      // If user has unsaved local edits or is sending/pulling, don't auto-pull in the background
      if (syncStatus === "unsaved" || isSending || isPulling) return;

      try {
        const res = await pullServerState(activeClassroomId, {
          force: false,
          hasLocalUnsaved: false,
        });

        if (res.status === "updated" && res.serverState) {
          setState({
            ...res.serverState,
            classroomId: activeClassroomId,
            currentDate: getTodayDateString(),
          });
          setSyncStatus("saved");
          showToast("Updated with latest notes from cloud!");
        }
      } catch {
        // Silently ignore background check errors
      }
    };

    document.addEventListener("visibilitychange", handleTabResume);
    window.addEventListener("focus", handleTabResume);

    return () => {
      document.removeEventListener("visibilitychange", handleTabResume);
      window.removeEventListener("focus", handleTabResume);
    };
  }, [activeClassroomId, syncStatus, isSending, isPulling]);

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
      const currentEntry = prev.entries[activeStudent.id] || {
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
            ...currentEntry,
            selections: {
              ...currentEntry.selections,
              [categoryId]: optionId,
            },
          },
        },
      };
    });
  };

  // Update notes 1
  const handleNotes1Change = (val: string) => {
    updateStateLocally((prev) => {
      const currentEntry = prev.entries[activeStudent.id] || {
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
            ...currentEntry,
            notes1: val,
          },
        },
      };
    });
  };

  // Update notes 2
  const handleNotes2Change = (val: string) => {
    updateStateLocally((prev) => {
      const currentEntry = prev.entries[activeStudent.id] || {
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
            ...currentEntry,
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
        body: JSON.stringify({ state, classroomId: activeClassroomId }),
      });

      const result: SendResult = await res.json();
      if (result.success) {
        // Mark as sent today
        const updated = {
          ...state,
          sentDate: state.currentDate,
          updatedAt: Date.now(),
        };
        setState(updated);
        saveLocalState(updated, activeClassroomId);
        syncStateToServer(updated, activeClassroomId);
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
      updatedAt: Date.now(),
    };
    setState(updated);
    saveLocalState(updated, activeClassroomId);
    syncStateToServer(updated, activeClassroomId);
    setSyncStatus("saved");
    setShowResetModal(false);
    showToast(`${classroomProfile.name} entries reset for next day!`);
  };

  return (
    <div className="min-h-screen flex flex-col pb-12 bg-slate-50 dark:bg-slate-950">
      {/* Navigation Header */}
      <Navbar
        currentDate={state.currentDate}
        syncStatus={syncStatus}
        onManualSync={triggerSync}
        onPullCloud={() => handleManualPull(false)}
        isPulling={isPulling}
        onLogout={logout}
        classroomId={activeClassroomId}
        userRole={session?.role || "teacher"}
        onSwitchClassroom={switchClassroom}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 dark:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl border border-gray-800 dark:border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom-2">
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
          onSelectStudent={(id) => setSelectedStudentId(id)}
          entries={state.entries}
        />

        {/* Active Student Header Banner */}
        <div
          className={`rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-white transition-colors ${
            activeClassroomId === "megan"
              ? "bg-gradient-to-r from-emerald-600 to-teal-700"
              : "bg-gradient-to-r from-sky-600 to-sky-700"
          }`}
        >
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold tracking-wider opacity-90">
                {classroomProfile.name} • Recording Report For
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{activeStudent.name}</h2>
            <p className="text-xs opacity-90 mt-0.5">
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
        title={`Send All Daily Reports for ${classroomProfile.name}?`}
        message={`This will send individual plain text emails to parents/guardians for each student, plus a consolidated master summary to ${classroomProfile.teacherName}.`}
        confirmText="Yes, Send All Reports"
        variant="primary"
        isProcessing={isSending}
        details={
          <div className="space-y-1.5">
            <p className="font-bold text-gray-800 dark:text-slate-200">Dispatch Summary:</p>
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
          <p className="text-amber-800 dark:text-amber-300">
            Re-sending will dispatch another set of emails to all parent inboxes for today ({state.currentDate}).
          </p>
        }
        onConfirm={executeSend}
        onCancel={() => setShowResendWarningModal(false)}
      />

      {/* MODAL 3: Reset for Next Day Guard */}
      <ConfirmModal
        isOpen={showResetModal}
        title={`Reset All Entries for ${classroomProfile.name}?`}
        message="Are you sure you want to reset all students' dropdowns to defaults and clear Notes 1 & Notes 2?"
        confirmText="Yes, Reset Everything"
        variant="danger"
        details={
          <p className="text-rose-800 dark:text-rose-300">
            ⚠️ This will clear today&apos;s typed notes and restore all menu selections to their default &quot;No report&quot; states for {classroomProfile.name}.
          </p>
        }
        onConfirm={executeReset}
        onCancel={() => setShowResetModal(false)}
      />

      {/* MODAL 4: Cloud Sync Conflict Guard */}
      <ConflictModal
        isOpen={showConflictModal}
        onPullCloud={() => handleManualPull(true)}
        onKeepLocal={() => {
          setShowConflictModal(false);
          triggerSync(true);
        }}
        onCancel={() => setShowConflictModal(false)}
        isProcessing={isPulling}
      />
    </div>
  );
}
