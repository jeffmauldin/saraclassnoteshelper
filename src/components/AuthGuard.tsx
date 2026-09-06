"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { Lock, KeyRound, AlertCircle, ArrowRight, Shield } from "lucide-react";
import {
  getAuthSession,
  saveAuthSession,
  clearAuthSession,
  getActiveClassroomId,
  setActiveClassroomId as setStoredActiveClassroom,
} from "@/lib/storage";
import { AuthSession, ClassroomId, UserRole } from "@/lib/types";
import { CLASSROOM_PROFILES } from "@/lib/initialData";

interface SessionContextType {
  session: AuthSession | null;
  activeClassroomId: ClassroomId;
  switchClassroom: (id: ClassroomId) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  activeClassroomId: "sara",
  switchClassroom: () => {},
  logout: () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeClassroomId, setActiveClassroomIdState] = useState<ClassroomId>("sara");
  const [isLoading, setIsLoading] = useState(true);

  // Login form states
  const [selectedClassroomTab, setSelectedClassroomTab] = useState<ClassroomId | "admin">("sara");
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const existing = getAuthSession();
    if (existing) {
      setSession(existing);
      const active = getActiveClassroomId();
      // If teacher session is locked to specific classroom, enforce it
      if (existing.role === "teacher" && existing.classroomId !== "all") {
        setActiveClassroomIdState(existing.classroomId);
        setStoredActiveClassroom(existing.classroomId);
      } else {
        setActiveClassroomIdState(active);
      }
    }
    setIsLoading(false);
  }, []);

  const switchClassroom = (id: ClassroomId) => {
    // Only admin can switch classrooms
    if (session?.role !== "admin") return;
    setActiveClassroomIdState(id);
    setStoredActiveClassroom(id);
  };

  const logout = () => {
    clearAuthSession();
    setSession(null);
    setPassphrase("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const requestedClassroom = selectedClassroomTab === "admin" ? undefined : selectedClassroomTab;

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passphrase: passphrase.trim(),
          requestedClassroom,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const role: UserRole = data.role || "teacher";
        const classroomId: ClassroomId | "all" = role === "admin" ? "all" : data.classroomId || "sara";
        const targetClassroom: ClassroomId =
          role === "admin"
            ? (selectedClassroomTab === "megan" ? "megan" : "sara")
            : (data.classroomId || "sara");

        saveAuthSession(role, classroomId);
        setStoredActiveClassroom(targetClassroom);
        setActiveClassroomIdState(targetClassroom);
        setSession({
          authenticated: true,
          role,
          classroomId,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });
      } else {
        setError(data.message || "Incorrect passcode. Please try again.");
      }
    } catch {
      // Offline fallback
      if (passphrase === "admin2026") {
        saveAuthSession("admin", "all");
        setSession({
          authenticated: true,
          role: "admin",
          classroomId: "all",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });
      } else if (passphrase === "sara2026") {
        saveAuthSession("teacher", "sara");
        setStoredActiveClassroom("sara");
        setActiveClassroomIdState("sara");
        setSession({
          authenticated: true,
          role: "teacher",
          classroomId: "sara",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });
      } else if (passphrase === "megan2026") {
        saveAuthSession("teacher", "megan");
        setStoredActiveClassroom("megan");
        setActiveClassroomIdState("megan");
        setSession({
          authenticated: true,
          role: "teacher",
          classroomId: "megan",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });
      } else {
        setError("Invalid passcode. Please check and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-slate-800">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 p-4 rounded-3xl mb-3 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Classroom Daily Log &amp; Reporting
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Select your classroom and enter your passcode. Recognized devices remain logged in for 30 days.
            </p>
          </div>

          {/* Classroom Selection Pills */}
          <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedClassroomTab("sara")}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1 ${
                selectedClassroomTab === "sara"
                  ? "bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
              }`}
            >
              <span>☀️</span>
              <span>Sara</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedClassroomTab("megan")}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1 ${
                selectedClassroomTab === "megan"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
              }`}
            >
              <span>🌸</span>
              <span>Megan</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedClassroomTab("admin")}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1 ${
                selectedClassroomTab === "admin"
                  ? "bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-1">
                {selectedClassroomTab === "admin"
                  ? "Admin Master Passcode"
                  : `${CLASSROOM_PROFILES[selectedClassroomTab].name} Passcode`}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder={
                    selectedClassroomTab === "sara"
                      ? "Enter Sara's passcode..."
                      : selectedClassroomTab === "megan"
                      ? "Enter Megan's passcode..."
                      : "Enter Admin master passcode..."
                  }
                  autoFocus
                  required
                  className="w-full px-4 py-3 pl-11 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900/50 outline-none text-sm font-medium transition"
                />
                <KeyRound className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !passphrase}
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    Unlock{" "}
                    {selectedClassroomTab === "admin"
                      ? "Admin Mode"
                      : CLASSROOM_PROFILES[selectedClassroomTab].name}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-center text-gray-400 dark:text-slate-500 space-y-1 pt-1">
              <p>
                Defaults: Sara: <code className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-1 py-0.5 rounded font-mono">sara2026</code> |{" "}
                Megan: <code className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-1 py-0.5 rounded font-mono">megan2026</code> |{" "}
                Admin: <code className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-1 py-0.5 rounded font-mono">admin2026</code>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        activeClassroomId,
        switchClassroom,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
