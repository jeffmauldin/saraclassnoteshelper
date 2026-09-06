"use client";

import React from "react";
import { AlertTriangle, DownloadCloud, UploadCloud, X } from "lucide-react";

interface ConflictModalProps {
  isOpen: boolean;
  onPullCloud: () => void;
  onKeepLocal: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function ConflictModal({
  isOpen,
  onPullCloud,
  onKeepLocal,
  onCancel,
  isProcessing = false,
}: ConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-150 dark:border-slate-800 relative">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-3.5 mb-4">
          <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cloud Notes Conflict</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
              Newer notes were saved to the cloud from another device, but you also have unsaved draft notes on this screen.
            </p>
          </div>
        </div>

        <div className="my-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
          <p className="font-semibold">Choose how you would like to resolve this:</p>
          <p>
            • <strong>Pull Cloud Notes:</strong> Replaces your local screen draft with the latest version saved from your other device.
          </p>
          <p>
            • <strong>Keep Local Draft:</strong> Keeps what you currently have typed on this device and saves it to the cloud.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            Cancel / Review Notes
          </button>

          <button
            type="button"
            onClick={onKeepLocal}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Keep Local &amp; Sync</span>
          </button>

          <button
            type="button"
            onClick={onPullCloud}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Pull Cloud Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
