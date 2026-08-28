"use client";

import React from "react";
import { AlertTriangle, HelpCircle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "primary";
  details?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  details,
  onConfirm,
  onCancel,
  isProcessing = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-3.5 mb-4">
          <div
            className={`p-3 rounded-2xl flex-shrink-0 ${
              variant === "danger"
                ? "bg-rose-100 text-rose-600"
                : variant === "warning"
                ? "bg-amber-100 text-amber-700"
                : "bg-sky-100 text-sky-600"
            }`}
          >
            {variant === "danger" || variant === "warning" ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <HelpCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
        </div>

        {details && (
          <div className="my-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 max-h-48 overflow-y-auto">
            {details}
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition flex items-center space-x-2 ${
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-700 ring-rose-300"
                : variant === "warning"
                ? "bg-amber-600 hover:bg-amber-700 ring-amber-300"
                : "bg-sky-600 hover:bg-sky-700 ring-sky-300"
            } ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isProcessing && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
