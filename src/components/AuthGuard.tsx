"use client";

import React, { useState, useEffect } from "react";
import { Lock, KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import { checkAuthSession, saveAuthSession } from "@/lib/storage";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isAuth = checkAuthSession();
    setIsAuthenticated(isAuth);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        saveAuthSession();
        setIsAuthenticated(true);
      } else {
        setError(data.message || "Incorrect password. Please try again.");
      }
    } catch {
      // Fallback local check if offline
      if (passphrase === "sara2026") {
        saveAuthSession();
        setIsAuthenticated(true);
      } else {
        setError("Invalid passcode. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    // Loading state while checking localStorage
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-sky-50 text-sky-600 p-4 rounded-3xl mb-3 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Sara&apos;s Classroom Daily Log
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Enter your passcode to unlock reports. Recognized devices remain unlocked for 30 days.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter passcode..."
                  autoFocus
                  required
                  className="w-full px-4 py-3 pl-11 rounded-2xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-sm font-medium transition"
                />
                <KeyRound className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passphrase}
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Daily Log</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-gray-400">
              Default passcode: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">sara2026</code> (changeable in Settings)
            </p>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
