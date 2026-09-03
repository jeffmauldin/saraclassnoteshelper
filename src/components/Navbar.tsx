"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatFriendlyDate } from "@/lib/emailFormatter";
import { CLASSROOM_PROFILES } from "@/lib/initialData";
import { ClassroomId, UserRole } from "@/lib/types";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Settings,
  Eye,
  Lock,
  ChevronDown,
  Shield,
  Check,
} from "lucide-react";

interface NavbarProps {
  currentDate: string;
  syncStatus: "saved" | "unsaved" | "syncing" | "error";
  onManualSync: () => void;
  onLogout: () => void;
  classroomId?: ClassroomId;
  userRole?: UserRole;
  onSwitchClassroom?: (id: ClassroomId) => void;
}

export function Navbar({
  currentDate,
  syncStatus,
  onManualSync,
  onLogout,
  classroomId = "sara",
  userRole = "teacher",
  onSwitchClassroom,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profile = CLASSROOM_PROFILES[classroomId] || CLASSROOM_PROFILES.sara;

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Classroom Selector */}
        <div className="flex items-center space-x-3">
          <div
            className={`font-bold text-lg p-2 rounded-xl shadow-sm flex items-center justify-center w-10 h-10 ${
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
                    className="flex items-center space-x-1.5 font-bold text-base sm:text-lg text-gray-900 hover:text-sky-600 transition group focus:outline-none"
                    title="Admin: Click to switch classroom"
                  >
                    <span>{profile.name} Daily Log</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-0.5">
                      <Shield className="w-2.5 h-2.5 mr-0.5" />
                      Admin
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
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
                                ? "bg-sky-50 text-sky-900 font-semibold"
                                : "text-gray-700 hover:bg-gray-50 font-normal"
                            }`}
                          >
                            <span className="flex items-center space-x-2">
                              <span>{p.icon}</span>
                              <span>{p.name}</span>
                            </span>
                            {isActive && <Check className="w-4 h-4 text-sky-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/" className="font-bold text-base sm:text-lg text-gray-900 hover:text-sky-600 transition">
                  {profile.name} Daily Log
                </Link>
              )}
            </div>
            <p className="text-xs font-medium text-gray-500">
              📅 {formatFriendlyDate(currentDate)}
            </p>
          </div>
        </div>

        {/* Right: Sync Status & Navigation Links */}
        <div className="flex items-center space-x-2">
          {/* Sync Button & Status */}
          <button
            onClick={onManualSync}
            title="Click to sync data with cloud/other devices"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              syncStatus === "saved"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : syncStatus === "syncing"
                ? "bg-sky-50 text-sky-700 border-sky-200 animate-pulse"
                : syncStatus === "unsaved"
                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {syncStatus === "saved" && <Cloud className="w-3.5 h-3.5 text-emerald-600" />}
            {syncStatus === "syncing" && <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />}
            {syncStatus === "unsaved" && <CloudOff className="w-3.5 h-3.5 text-amber-600" />}
            {syncStatus === "error" && <CloudOff className="w-3.5 h-3.5 text-rose-600" />}
            <span className="hidden sm:inline">
              {syncStatus === "saved" && "Synced to Cloud"}
              {syncStatus === "syncing" && "Syncing..."}
              {syncStatus === "unsaved" && "Unsaved (Click to Sync)"}
              {syncStatus === "error" && "Sync Error"}
            </span>
          </button>

          {/* Email Preview */}
          <Link
            href="/preview"
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
            title="Preview generated emails before sending"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Email Preview</span>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
            title="Manage Students, Dropdowns, and Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Lock application session"
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

