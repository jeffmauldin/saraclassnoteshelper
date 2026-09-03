"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AuthGuard, useSession } from "@/components/AuthGuard";
import { loadLocalState, fetchServerState } from "@/lib/storage";
import { CLASSROOM_PROFILES, getInitialStateForClassroom } from "@/lib/initialData";
import { AppState, ClassroomId, SendResult } from "@/lib/types";
import {
  formatIndividualStudentEmail,
  formatMasterSummaryEmail,
} from "@/lib/emailFormatter";
import { ArrowLeft, Play, Mail, FileText, ShieldCheck, Shield } from "lucide-react";

export default function PreviewPage() {
  return (
    <AuthGuard>
      <PreviewContent />
    </AuthGuard>
  );
}

function PreviewContent() {
  const { session, activeClassroomId, switchClassroom } = useSession();
  const [state, setState] = useState<AppState>(() => getInitialStateForClassroom(activeClassroomId));
  const [selectedPreviewTab, setSelectedPreviewTab] = useState<string>("master");
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<SendResult | null>(null);

  const profile = CLASSROOM_PROFILES[activeClassroomId] || CLASSROOM_PROFILES.sara;

  useEffect(() => {
    const local = loadLocalState(activeClassroomId);
    setState(local);
    fetchServerState(activeClassroomId).then((serverState) => {
      if (serverState) setState(serverState);
    });
  }, [activeClassroomId]);

  const handleRunSimulator = async () => {
    setIsDryRunning(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, classroomId: activeClassroomId, forceSimulator: true }),
      });
      const result: SendResult = await res.json();
      setDryRunResult(result);
    } catch (e: any) {
      alert(`Simulation error: ${e.message}`);
    } finally {
      setIsDryRunning(false);
    }
  };

  const masterEmail = formatMasterSummaryEmail(state, state.currentDate);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition"
              title="Return to Daily Log"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-gray-900">
                  {profile.icon} {profile.name} Email Preview
                </h1>
                {session?.role === "admin" && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center">
                    <Shield className="w-2.5 h-2.5 mr-0.5" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Inspect plain-text emails before sending to parents
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Admin Classroom Switcher in Preview */}
            {session?.role === "admin" && (
              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold mr-1">
                {(Object.keys(CLASSROOM_PROFILES) as ClassroomId[]).map((cid) => (
                  <button
                    key={cid}
                    onClick={() => {
                      switchClassroom(cid);
                      setSelectedPreviewTab("master");
                    }}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeClassroomId === cid
                        ? "bg-white text-gray-900 shadow-xs font-bold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {CLASSROOM_PROFILES[cid].icon} {CLASSROOM_PROFILES[cid].teacherName}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleRunSimulator}
              disabled={isDryRunning}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              {isDryRunning ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>Run Dry-Run Test</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Simulator Success Banner */}
        {dryRunResult && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Dry Run Simulation Succeeded! ({dryRunResult.sentCount} emails simulated)</span>
            </div>
            <p className="text-xs text-emerald-800">
              All recipient addresses, plain text bodies, and master emails were validated with zero errors for {profile.name}.
            </p>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setSelectedPreviewTab("master")}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedPreviewTab === "master"
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Master Summary ({profile.teacherName}&apos;s Copy)</span>
          </button>

          {state.students.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedPreviewTab(st.id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedPreviewTab === st.id
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>{st.name}</span>
            </button>
          ))}
        </div>

        {/* Preview Content Box */}
        {selectedPreviewTab === "master" ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-gray-100 pb-3 space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase">Subject</p>
              <p className="text-sm font-black text-gray-900">{masterEmail.subject}</p>
              <p className="text-xs text-gray-500">
                To: {state.settings.emailSettings.masterRecipients.join(", ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Plain Text Body</p>
              <pre className="bg-gray-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {masterEmail.text}
              </pre>
            </div>
          </div>
        ) : (
          (() => {
            const student = state.students.find((s) => s.id === selectedPreviewTab);
            if (!student) return null;
            const entry = state.entries[student.id];
            const studentEmail = formatIndividualStudentEmail(
              student,
              entry,
              state.categories,
              state.currentDate,
              state.settings.emailSettings.fromName
            );

            return (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div className="border-b border-gray-100 pb-3 space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase">Subject</p>
                  <p className="text-sm font-black text-gray-900">{studentEmail.subject}</p>
                  <p className="text-xs text-gray-500">
                    To: {student.emails?.length ? student.emails.join(", ") : "(No emails configured)"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Plain Text Body</p>
                  <pre className="bg-gray-900 text-sky-300 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {studentEmail.text}
                  </pre>
                </div>
              </div>
            );
          })()
        )}
      </main>
    </div>
  );
}

