"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, AlertCircle } from "lucide-react";
import { createSpeechRecognizer, isSpeechRecognitionSupported } from "@/lib/speech";

interface NotesSectionProps {
  notes1: string;
  notes2: string;
  onChangeNotes1: (value: string) => void;
  onChangeNotes2: (value: string) => void;
}

export function NotesSection({
  notes1,
  notes2,
  onChangeNotes1,
  onChangeNotes2,
}: NotesSectionProps) {
  const [speechSupported, setSpeechSupported] = useState(false);
  const [activeRecordingField, setActiveRecordingField] = useState<1 | 2 | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  const startListening = (field: 1 | 2) => {
    setSpeechError(null);
    if (activeRecordingField) {
      stopListening();
    }

    const recognizer = createSpeechRecognizer(
      (text) => {
        if (field === 1) {
          onChangeNotes1(notes1 ? `${notes1} ${text}` : text);
        } else {
          onChangeNotes2(notes2 ? `${notes2} ${text}` : text);
        }
      },
      (err) => {
        setSpeechError(err);
        setActiveRecordingField(null);
      },
      () => {
        setActiveRecordingField(null);
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        setRecognitionInstance(recognizer);
        setActiveRecordingField(field);
      } catch (err: any) {
        setSpeechError("Could not access microphone.");
        setActiveRecordingField(null);
      }
    }
  };

  const stopListening = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {
        console.warn(e);
      }
      setRecognitionInstance(null);
    }
    setActiveRecordingField(null);
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <h3 className="font-bold text-gray-800 text-sm flex items-center space-x-2">
          <span>📝 Daily Teacher Notes</span>
        </h3>
        {speechSupported ? (
          <span className="text-xs text-emerald-600 flex items-center space-x-1 font-medium">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice Dictation Ready</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400">Typing Mode</span>
        )}
      </div>

      {speechError && (
        <div className="bg-rose-50 text-rose-700 text-xs p-2.5 rounded-xl flex items-center space-x-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Notes 1 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-gray-700">
            Notes 1 (General Day, Activities & Highlights)
          </label>
          {speechSupported && (
            <button
              type="button"
              onClick={() =>
                activeRecordingField === 1 ? stopListening() : startListening(1)
              }
              className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                activeRecordingField === 1
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {activeRecordingField === 1 ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Listening... Tap to stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-sky-600" />
                  <span>Voice Dictate</span>
                </>
              )}
            </button>
          )}
        </div>
        <textarea
          rows={3}
          value={notes1}
          onChange={(e) => onChangeNotes1(e.target.value)}
          placeholder="e.g. Alex had a great speech therapy session today. Played nicely during free play..."
          className="w-full text-sm p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition"
        />
      </div>

      {/* Notes 2 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-gray-700">
            Notes 2 (Reminders, Supplies, or Special Follow-ups)
          </label>
          {speechSupported && (
            <button
              type="button"
              onClick={() =>
                activeRecordingField === 2 ? stopListening() : startListening(2)
              }
              className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                activeRecordingField === 2
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {activeRecordingField === 2 ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Listening... Tap to stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-sky-600" />
                  <span>Voice Dictate</span>
                </>
              )}
            </button>
          )}
        </div>
        <textarea
          rows={2}
          value={notes2}
          onChange={(e) => onChangeNotes2(e.target.value)}
          placeholder="e.g. Please send extra change of clothes tomorrow. Reminder: Early dismissal on Friday..."
          className="w-full text-sm p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition"
        />
      </div>
    </div>
  );
}
