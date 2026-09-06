"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatFriendlyDate } from "@/lib/emailFormatter";
import { CLASSROOM_PROFILES } from "@/lib/initialData";
import { ClassroomId, UserRole } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import {
  Cloud,
  CloudOff,
  DownloadCloud,
  RefreshCw,
  Settings,
  Eye,
  Lock,
  ChevronDown,
  Shield,
  Check,
  Sun,
  Moon,
} from "lucide-react";

interface NavbarProps {
  currentDate: string;
  syncStatus: "saved" | "unsaved" | "syncing" | "error";
  onManualSync: () => void;
  onPullCloud?: () => void;
  isPulling?: boolean;
  onLogout: () => void;
  classroomId?: ClassroomId;
  userRole?: UserRole;
  onSwitchClassroom?: (id: ClassroomId) => void;
}

export function Navbar({
  currentDate,
  syncStatus,
  onManualSync,
  onPullCloud,
  isPulling = false,
  onLogout,
  classroomId = "sara",
  userRole = "teacher",
  onSwitchClassroom,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profile = CLASSROOM_PROFILES[classroomId] || CLASSROOM_PROFILES.sara;
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: ClassroomId) => {
    setDropdownOpen(false);
    if (onSwitchClassroom && id !== classroomId) {
      onSwitchClassroom(id);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Classroom Selector */}
        <div className="flex items-center space-x-3">
          <div
            className={`font-bold text-lg p-2 rounded-xl shadow-xs flex items-center justify-center w-10 h-10 ${
              classroomId === "megan"
                ? "bg-emerald-600 text-white"
                : "bg-sky-600 text-white"
            }`}
          >
            {profile.icon}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              {userRole === "admin" ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center space-x-1.5 font-bold text-base sm:text-lg text-gray-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition group focus:outline-none"
                    title="Admin: Click to switch classroom"
                  >
                    <span>{profile.name} Daily Log</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center space-x-0.5">
                      <Shield className="w-2.5 h-2.5 mr-0.5" />
                      Admin
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-200 transition" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-800">
                        Switch Classroom (Admin)
                      </div>
                      {(Object.keys(CLASSROOM_PROFILES) as ClassroomId[]).map((cid) => {
                        const p = CLASSROOM_PROFILES[cid];
                        const isActive = cid === classroomId;
                        return (
                          <button
                            key={cid}
                            onClick={() => handleSelect(cid)}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition ${
                              isActive
                                ? "bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 font-semibold"
                                : "text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-normal"
                            }`}
                          >
                            <span className="flex items-center space-x-2">
                              <span>{p.icon}</span>
                              <span>{p.name}</span>
                            </span>
                            {isActive && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/" className="font-bold text-base sm:text-lg text-gray-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition">
                  {profile.name} Daily Log
                </Link>
              )}
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
              📅 {formatFriendlyDate(currentDate)}
            </p>
          </div>
        </div>

        {/* Right: Sync Status & Navigation Links */}
        <div className="flex items-center space-x-2">
          {/* Sync Button & Status (Push) */}
          <button
            onClick={onManualSync}
            title="Click to sync data with cloud/other devices"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              syncStatus === "saved"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                : syncStatus === "syncing"
                ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 animate-pulse"
                : syncStatus === "unsaved"
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
            }`}
          >
            {syncStatus === "saved" && <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            {syncStatus === "syncing" && <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-sky-400" />}
            {syncStatus === "unsaved" && <CloudOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
            {syncStatus === "error" && <CloudOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
            <span className="hidden sm:inline">
              {syncStatus === "saved" && "Synced to Cloud"}
              {syncStatus === "syncing" && "Syncing..."}
              {syncStatus === "unsaved" && "Unsaved (Click to Sync)"}
              {syncStatus === "error" && "Sync Error"}
            </span>
          </button>

          {/* Pull Cloud Button */}
          {onPullCloud && (
            <button
              onClick={onPullCloud}
              disabled={isPulling}
              title="Pull latest notes from cloud / other devices"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPulling ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-sky-400" />
              ) : (
                <DownloadCloud className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              )}
              <span className="hidden sm:inline">
                {isPulling ? "Pulling..." : "Pull Cloud"}
              </span>
            </button>
          )}

          {/* Email Preview */}
          <Link
            href="/preview"
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition"
            title="Preview generated emails before sending"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Email Preview</span>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition"
            title="Manage Students, Dropdowns, and Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {/* Quick Theme Toggle (Sun/Moon) */}
          <button
            onClick={toggleTheme}
            title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle light/dark theme"
            className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Lock application session"
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
