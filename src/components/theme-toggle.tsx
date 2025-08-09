"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function applyThemeClass(isDark: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? window.localStorage.getItem("theme") : null;
    const initialDark = stored ? stored === "dark" : getSystemPrefersDark();
    setIsDark(initialDark);
    applyThemeClass(initialDark);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      applyThemeClass(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("theme", next ? "dark" : "light");
      }
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/15 px-3 py-2 text-sm font-medium bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
    >
      {isDark ? (
        <>
          <Sun className="size-4" />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="size-4" />
          <span>Dark</span>
        </>
      )}
    </button>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-3xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 shadow-soft", className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-5", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6 space-y-3", className)} {...props} />;
}
