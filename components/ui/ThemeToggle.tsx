"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "qa-theme";

type ThemeMode = "light" | "dark";

const sunIcon = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5 fill-none stroke-current"
  >
    <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
    <path strokeWidth="1.5" strokeLinecap="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0-1.414-1.414M7.05 7.05 5.636 5.636" />
  </svg>
);

const moonIcon = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5 fill-none stroke-current"
  >
    <path
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12.79A9 9 0 1 1 11.21 3c.2-.01.39.09.5.26a.6.6 0 0 1-.05.72 6.5 6.5 0 0 0 8.36 9.11.6.6 0 0 1 .72-.05.53.53 0 0 1 .26.5Z"
    />
  </svg>
);

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const root = document.documentElement;
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    root.classList.toggle("dark", initial === "dark");
    root.dataset.theme = initial;
    setTheme(initial);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const next: ThemeMode = current === "dark" ? "light" : "dark";
      const root = document.documentElement;
      root.classList.toggle("dark", next === "dark");
      root.dataset.theme = next;
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-full border border-border/50 bg-surface-elevated/80" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={theme === "dark"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-surface-elevated/80 text-foreground shadow-sm transition hover:border-brand-teal/60 hover:text-brand-teal focus-visible:ring-brand-teal/60 dark:hover:border-brand-mint/50 dark:hover:text-brand-mint"
    >
      <span className="sr-only">Alternar entre modo claro e escuro</span>
      {theme === "dark" ? moonIcon : sunIcon}
    </button>
  );
}
