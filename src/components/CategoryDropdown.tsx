"use client";

import React from "react";
import { Category } from "@/lib/types";
import { ChevronDown, Check } from "lucide-react";

interface CategoryDropdownProps {
  category: Category;
  selectedOptionId: string;
  onChange: (categoryId: string, optionId: string) => void;
}

export function CategoryDropdown({
  category,
  selectedOptionId,
  onChange,
}: CategoryDropdownProps) {
  const currentOptionId = selectedOptionId || category.defaultOptionId;
  const isDefault = currentOptionId === category.defaultOptionId;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-800 dark:text-slate-100">
            {category.name}
          </label>
          {isDefault ? (
            <span className="text-[11px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
              Default
            </span>
          ) : (
            <span className="text-[11px] font-medium bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-full">
              Updated
            </span>
          )}
        </div>

        {/* Styled Native Select for reliability on mobile & desktop */}
        <div className="relative">
          <select
            value={currentOptionId}
            onChange={(e) => onChange(category.id, e.target.value)}
            style={{ colorScheme: "inherit" }}
            className={`w-full appearance-none px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-[border-color,box-shadow] duration-150 cursor-pointer pr-10 ${
              isDefault
                ? "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600"
                : "bg-sky-50/70 dark:bg-slate-800 border-sky-400 dark:border-sky-600 text-sky-950 dark:text-sky-200 font-semibold ring-1 ring-sky-300 dark:ring-sky-700"
            }`}
          >
            {category.options.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100">
                {opt.label} {opt.id === category.defaultOptionId ? "(Default)" : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Quick Tap Pills for Top Options */}
      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-800">
        {category.options.slice(0, 3).map((opt) => {
          const isSelected = opt.id === currentOptionId;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(category.id, opt.id)}
              className={`text-xs px-2.5 py-1 rounded-lg transition flex items-center space-x-1 ${
                isSelected
                  ? "bg-sky-600 text-white font-medium shadow-xs"
                  : "bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300"
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
              <span className="truncate max-w-[140px]">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
