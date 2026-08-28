"use client";

import React from "react";
import Link from "next/link";
import { formatFriendlyDate } from "@/lib/emailFormatter";
import { Cloud, CloudOff, RefreshCw, Settings, Eye, Lock } from "lucide-react";

interface NavbarProps {
  currentDate: string;
  syncStatus: "saved" | "unsaved" | "syncing" | "error";
  onManualSync: () => void;
  onLogout: () => void;
}

export function Navbar({
  currentDate,
  syncStatus,
  onManualSync,
  onLogout,
}: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Date */}
        <div className="flex items-center space-x-3">
          <div className="bg-sky-600 text-white font-bold text-lg p-2 rounded-xl shadow-sm flex items-center justify-center w-10 h-10">
            ☀️
          </div>
          <div>
            <Link href="/" className="font-bold text-lg text-gray-900 hover:text-sky-600 transition">
              Sara&apos;s Classroom Daily Log
            </Link>
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
