"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const THEME_KEY = "classnotes_theme_v1";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const val = localStorage.getItem(THEME_KEY);
    if (val === "dark" || val === "light" || val === "system") {
      return val;
    }
  } catch {}
  return "light";
}

export function applyThemeToDocument(mode: ThemeMode): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  
  let effective: "light" | "dark" = "light";
  if (mode === "system") {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    effective = prefersDark ? "dark" : "light";
  } else {
    effective = mode;
  }

  const root = document.documentElement;
  if (effective === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }

  return effective;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = getStoredTheme();
    setThemeState(saved);
    const resolved = applyThemeToDocument(saved);
    setResolvedTheme(resolved);

    // Listen for system theme changes if mode is 'system'
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = getStoredTheme();
      if (current === "system") {
        const res = applyThemeToDocument("system");
        setResolvedTheme(res);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {}
    const resolved = applyThemeToDocument(mode);
    setResolvedTheme(resolved);
  };

  const toggleTheme = () => {
    const next: ThemeMode = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
