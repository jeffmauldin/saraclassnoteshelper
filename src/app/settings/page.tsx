"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AuthGuard, useSession } from "@/components/AuthGuard";
import {
  getInitialStateForClassroom,
  createDefaultEntries,
  CLASSROOM_PROFILES,
} from "@/lib/initialData";
import { loadLocalState, saveLocalState, syncStateToServer, fetchServerState } from "@/lib/storage";
import { AppState, Category, Student, EmailProviderType, ClassroomId } from "@/lib/types";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Users,
  ListFilter,
  Mail,
  Shield,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const { session, activeClassroomId, switchClassroom } = useSession();
  const profile = CLASSROOM_PROFILES[activeClassroomId] || CLASSROOM_PROFILES.sara;
  const [state, setState] = useState<AppState>(() => getInitialStateForClassroom(activeClassroomId));
  const [activeTab, setActiveTab] = useState<"students" | "categories" | "email" | "security">("students");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Form states for adding new student
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentParents, setNewStudentParents] = useState("");
  const [newStudentEmails, setNewStudentEmails] = useState("");

  // Form states for adding new category
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    const local = loadLocalState(activeClassroomId);
    setState(local);
    fetchServerState(activeClassroomId).then((serverState) => {
      if (serverState) setState(serverState);
    });
  }, [activeClassroomId]);

  const handleSaveAll = async (overrideState?: AppState) => {
    const toSave: AppState = {
      ...(overrideState || state),
      updatedAt: Date.now(),
    };
    setSaveStatus("Saving...");
    saveLocalState(toSave, activeClassroomId);
    const ok = await syncStateToServer(toSave, activeClassroomId);
    if (ok) {
      setSaveStatus("Settings saved successfully!");
    } else {
      setSaveStatus("Saved locally (offline mode)");
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };


  // Student management
  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const emails = newStudentEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name: newStudentName.trim(),
      parentNames: newStudentParents.trim() || undefined,
      emails,
    };

    const updatedStudents = [...state.students, newStudent];
    const defaultEntries = createDefaultEntries(updatedStudents, state.categories);

    const updated: AppState = {
      ...state,
      students: updatedStudents,
      entries: {
        ...defaultEntries,
        ...state.entries,
      },
    };

    setState(updated);
    setNewStudentName("");
    setNewStudentParents("");
    setNewStudentEmails("");
    handleSaveAll(updated);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    const updatedStudents = state.students.filter((s) => s.id !== studentId);
    const updated: AppState = {
      ...state,
      students: updatedStudents,
    };
    setState(updated);
    handleSaveAll(updated);
  };

  const handleUpdateStudent = (index: number, field: keyof Student, value: any) => {
    const updatedStudents = [...state.students];
    if (field === "emails" && typeof value === "string") {
      updatedStudents[index] = {
        ...updatedStudents[index],
        emails: value.split(",").map((e) => e.trim()).filter(Boolean),
      };
    } else {
      updatedStudents[index] = {
        ...updatedStudents[index],
        [field]: value,
      };
    }
    const updated = { ...state, students: updatedStudents };
    setState(updated);
  };

  // Category management
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const catId = `cat-${Date.now()}`;
    const defaultOptId = `opt-${Date.now()}-none`;

    const newCat: Category = {
      id: catId,
      name: newCategoryName.trim(),
      defaultOptionId: defaultOptId,
      options: [
        { id: defaultOptId, label: "No report" },
        { id: `opt-${Date.now()}-1`, label: "Satisfactory" },
        { id: `opt-${Date.now()}-2`, label: "Needs attention" },
      ],
    };

    const updatedCategories = [...state.categories, newCat];
    const updated = { ...state, categories: updatedCategories };
    setState(updated);
    setNewCategoryName("");
    handleSaveAll(updated);
  };

  const handleDeleteCategory = (catId: string) => {
    if (!confirm("Are you sure you want to delete this dropdown category?")) return;
    const updatedCategories = state.categories.filter((c) => c.id !== catId);
    const updated = { ...state, categories: updatedCategories };
    setState(updated);
    handleSaveAll(updated);
  };

  const handleAddOptionToCategory = (catIndex: number) => {
    const label = prompt("Enter new dropdown option label:");
    if (!label?.trim()) return;
    const updatedCategories = [...state.categories];
    const newOpt = { id: `opt-${Date.now()}`, label: label.trim() };
    updatedCategories[catIndex].options.push(newOpt);
    const updated = { ...state, categories: updatedCategories };
    setState(updated);
    handleSaveAll(updated);
  };

  const handleDeleteOptionFromCategory = (catIndex: number, optId: string) => {
    const updatedCategories = [...state.categories];
    if (updatedCategories[catIndex].options.length <= 1) {
      alert("A category must have at least one option.");
      return;
    }
    updatedCategories[catIndex].options = updatedCategories[catIndex].options.filter(
      (o) => o.id !== optId
    );
    if (updatedCategories[catIndex].defaultOptionId === optId) {
      updatedCategories[catIndex].defaultOptionId = updatedCategories[catIndex].options[0].id;
    }
    const updated = { ...state, categories: updatedCategories };
    setState(updated);
    handleSaveAll(updated);
  };

  const handleSetDefaultOption = (catIndex: number, optId: string) => {
    const updatedCategories = [...state.categories];
    updatedCategories[catIndex].defaultOptionId = optId;
    const updated = { ...state, categories: updatedCategories };
    setState(updated);
  };

  // Reset to sample initial data
  const handleResetToSampleData = () => {
    if (
      !confirm(
        `Reset all students and categories for ${profile.name} to initial defaults? This will overwrite custom lists for ${profile.name}.`
      )
    )
      return;
    const sample = getInitialStateForClassroom(activeClassroomId);
    setState(sample);
    handleSaveAll(sample);
  };

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
                  {profile.icon} {profile.name} Settings
                </h1>
                {session?.role === "admin" && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center">
                    <Shield className="w-2.5 h-2.5 mr-0.5" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Manage students, dropdowns, emails &amp; security for {profile.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Admin Classroom Switcher */}
            {session?.role === "admin" && (
              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold mr-1">
                {(Object.keys(CLASSROOM_PROFILES) as ClassroomId[]).map((cid) => (
                  <button
                    key={cid}
                    onClick={() => switchClassroom(cid)}
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

            {saveStatus && (
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {saveStatus}
              </span>
            )}
            <button
              onClick={() => handleSaveAll()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Settings Navigation Tabs */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
              activeTab === "students"
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students ({state.students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
              activeTab === "categories"
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Categories &amp; Dropdowns ({state.categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("email")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
              activeTab === "email"
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Delivery Setup</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
              activeTab === "security"
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Passcode & Security</span>
          </button>
        </div>

        {/* TAB 1: STUDENTS MANAGER */}
        {activeTab === "students" && (
          <div className="space-y-6">
            {/* Add Student Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Add New Student to {profile.name}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Student Name (e.g. Emma W.)"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-gray-200 focus:border-sky-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Parent/Guardian (e.g. Jane Watson)"
                  value={newStudentParents}
                  onChange={(e) => setNewStudentParents(e.target.value)}
                  className="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-gray-200 focus:border-sky-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Parent Emails (comma-separated)"
                  value={newStudentEmails}
                  onChange={(e) => setNewStudentEmails(e.target.value)}
                  className="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-gray-200 focus:border-sky-500 outline-none font-mono"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <p className="text-[11px] text-gray-400">
                  💡 <span className="font-semibold text-gray-600">Testing Tip:</span> Use Gmail sub-addressing (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-gray-700">mauldinjeff+student@gmail.com</code>) so test reports safely route straight to your inbox!
                </p>
                <button
                  type="button"
                  onClick={handleAddStudent}
                  disabled={!newStudentName.trim()}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Add Student to Classroom
                </button>
              </div>
            </div>

            {/* Students List */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Current Students ({state.students.length})
              </h2>

              {state.students.map((student, idx) => (
                <div
                  key={student.id}
                  className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">
                        Student Name
                      </label>
                      <input
                        type="text"
                        value={student.name}
                        onChange={(e) => handleUpdateStudent(idx, "name", e.target.value)}
                        className="w-full text-xs font-bold text-gray-800 p-2 rounded-lg border border-gray-200"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">
                        Parents / Guardians
                      </label>
                      <input
                        type="text"
                        value={student.parentNames || ""}
                        onChange={(e) =>
                          handleUpdateStudent(idx, "parentNames", e.target.value)
                        }
                        placeholder="e.g. John & Mary"
                        className="w-full text-xs text-gray-700 p-2 rounded-lg border border-gray-200"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">
                        Email Recipients (Comma-Separated)
                      </label>
                      <input
                        type="text"
                        value={student.emails.join(", ")}
                        onChange={(e) =>
                          handleUpdateStudent(idx, "emails", e.target.value)
                        }
                        placeholder="parent1@example.com, parent2@example.com"
                        className="w-full text-xs text-gray-700 p-2 rounded-lg border border-gray-200 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition self-end sm:self-center"
                    title="Delete student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES & DROPDOWNS MANAGER */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Add Category */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Add New Dropdown Category</span>
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Lunch Report, Social Interaction)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs font-medium rounded-xl border border-gray-200 focus:border-sky-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Create Category
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-4">
              {state.categories.map((cat, catIdx) => (
                <div
                  key={cat.id}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => {
                        const updated = [...state.categories];
                        updated[catIdx].name = e.target.value;
                        setState({ ...state, categories: updated });
                      }}
                      className="font-bold text-sm text-gray-900 border-b border-dashed border-gray-300 focus:border-sky-500 outline-none pb-0.5"
                    />

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddOptionToCategory(catIdx)}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Option</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options pills */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-semibold text-gray-400">
                      Options (Click &quot;Make Default&quot; to set the initial reset value):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.options.map((opt) => {
                        const isDefault = opt.id === cat.defaultOptionId;
                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                              isDefault
                                ? "bg-sky-50/70 border-sky-300 text-sky-950 font-semibold"
                                : "bg-gray-50 border-gray-200 text-gray-700"
                            }`}
                          >
                            <span className="truncate">{opt.label}</span>
                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              {isDefault ? (
                                <span className="text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded-md font-bold flex items-center space-x-0.5">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Default</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefaultOption(catIdx, opt.id)}
                                  className="text-[10px] text-gray-500 hover:text-sky-600 hover:underline px-1 py-0.5"
                                >
                                  Make Default
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteOptionFromCategory(catIdx, opt.id)
                                }
                                className="text-gray-400 hover:text-rose-600 p-1"
                                title="Remove option"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EMAIL CONFIGURATION */}
        {activeTab === "email" && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-sky-600" />
                <span>Email Sending Method</span>
              </h2>

              {/* Provider Selection Radio Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Simulator Mode */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    state.settings.emailSettings.provider === "simulator"
                      ? "bg-sky-50/50 border-sky-600 ring-2 ring-sky-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-gray-900">
                      🧪 Test Simulator Mode
                    </span>
                    <input
                      type="radio"
                      name="provider"
                      value="simulator"
                      checked={state.settings.emailSettings.provider === "simulator"}
                      onChange={() =>
                        setState({
                          ...state,
                          settings: {
                            ...state.settings,
                            emailSettings: {
                              ...state.settings.emailSettings,
                              provider: "simulator",
                            },
                          },
                        })
                      }
                      className="text-sky-600"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Works instantly with zero setup. Simulates sending and logs output for review.
                  </p>
                </label>

                {/* Google App Password */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    state.settings.emailSettings.provider === "gmail"
                      ? "bg-sky-50/50 border-sky-600 ring-2 ring-sky-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-gray-900">
                      ✉️ Gmail (App Password)
                    </span>
                    <input
                      type="radio"
                      name="provider"
                      value="gmail"
                      checked={state.settings.emailSettings.provider === "gmail"}
                      onChange={() =>
                        setState({
                          ...state,
                          settings: {
                            ...state.settings,
                            emailSettings: {
                              ...state.settings.emailSettings,
                              provider: "gmail",
                            },
                          },
                        })
                      }
                      className="text-sky-600"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Sends directly from your or Sara&apos;s personal Gmail address with 16-letter App Password.
                  </p>
                </label>

                {/* Brevo API */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    state.settings.emailSettings.provider === "brevo"
                      ? "bg-sky-50/50 border-sky-600 ring-2 ring-sky-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-gray-900">
                      ⚡ Brevo API (Free Tier)
                    </span>
                    <input
                      type="radio"
                      name="provider"
                      value="brevo"
                      checked={state.settings.emailSettings.provider === "brevo"}
                      onChange={() =>
                        setState({
                          ...state,
                          settings: {
                            ...state.settings,
                            emailSettings: {
                              ...state.settings.emailSettings,
                              provider: "brevo",
                            },
                          },
                        })
                      }
                      className="text-sky-600"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Free 300 emails/day without sharing mailbox password.
                  </p>
                </label>
              </div>

              {/* Provider Config Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Teacher / Sender Display Name
                  </label>
                  <input
                    type="text"
                    value={state.settings.emailSettings.fromName}
                    onChange={(e) =>
                      setState({
                        ...state,
                        settings: {
                          ...state.settings,
                          emailSettings: {
                            ...state.settings.emailSettings,
                            fromName: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Sara (Special Education Teacher)"
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Gmail Address (for Sender &amp; Reply-To)
                  </label>
                  <input
                    type="email"
                    value={state.settings.emailSettings.gmailUser}
                    onChange={(e) =>
                      setState({
                        ...state,
                        settings: {
                          ...state.settings,
                          emailSettings: {
                            ...state.settings.emailSettings,
                            gmailUser: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="sara.specialed@gmail.com"
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                {state.settings.emailSettings.provider === "gmail" && (
                  <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 space-y-2">
                    <label className="block text-xs font-bold text-sky-900">
                      Google 16-Letter App Password
                    </label>
                    <input
                      type="password"
                      value={state.settings.emailSettings.gmailAppPassword || ""}
                      onChange={(e) =>
                        setState({
                          ...state,
                          settings: {
                            ...state.settings,
                            emailSettings: {
                              ...state.settings.emailSettings,
                              gmailAppPassword: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. abcd efgh ijkl mnop"
                      className="w-full text-xs p-3 rounded-xl border border-sky-300 outline-none focus:ring-2 focus:ring-sky-200 font-mono bg-white"
                    />
                    <p className="text-[11px] text-sky-800">
                      💡 Generate at{" "}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold"
                      >
                        myaccount.google.com/apppasswords
                      </a>
                      . First use your password for validation, then swap to Sara&apos;s!
                    </p>
                  </div>
                )}

                {state.settings.emailSettings.provider === "brevo" && (
                  <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 space-y-2">
                    <label className="block text-xs font-bold text-sky-900">
                      Brevo API Key
                    </label>
                    <input
                      type="password"
                      value={state.settings.emailSettings.brevoApiKey || ""}
                      onChange={(e) =>
                        setState({
                          ...state,
                          settings: {
                            ...state.settings,
                            emailSettings: {
                              ...state.settings.emailSettings,
                              brevoApiKey: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="xkeysib-..."
                      className="w-full text-xs p-3 rounded-xl border border-sky-300 outline-none focus:ring-2 focus:ring-sky-200 font-mono bg-white"
                    />
                  </div>
                )}

                {/* Master Summary Recipients */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Master Daily Summary Recipients (Sara + Admin Testing Emails)
                  </label>
                  <input
                    type="text"
                    value={state.settings.emailSettings.masterRecipients.join(", ")}
                    onChange={(e) =>
                      setState({
                        ...state,
                        settings: {
                          ...state.settings,
                          emailSettings: {
                            ...state.settings.emailSettings,
                            masterRecipients: e.target.value
                              .split(",")
                              .map((m) => m.trim())
                              .filter(Boolean),
                          },
                        },
                      })
                    }
                    placeholder="sara-teacher@example.com, admin-test@example.com"
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-sky-500 font-mono"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    You can remove your testing email here once the system is fully validated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PASSCODE & SECURITY */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-sky-600" />
                <span>Passcode &amp; Device Persistence</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Classroom Passcode
                </label>
                <input
                  type="text"
                  value={state.settings.passphrase}
                  onChange={(e) =>
                    setState({
                      ...state,
                      settings: {
                        ...state.settings,
                        passphrase: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-sky-500 font-mono max-w-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Recognized phones and laptops stay unlocked for 30 days.
                </p>
              </div>

              {/* Sample Data Reset */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-700 mb-1">
                  Testing / Sample Sandbox Data
                </h3>
                <button
                  type="button"
                  onClick={handleResetToSampleData}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                >
                  Reload 3 Sample Students &amp; Categories
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
