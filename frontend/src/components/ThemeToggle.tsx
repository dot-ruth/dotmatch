"use client";

import { useTheme } from "@/lib/ThemeProvider";

export default function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-surface-deep dark:hover:bg-surface-dark-deep transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg className="w-4 h-4 text-muted dark:text-muted-dark shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-muted dark:text-muted-dark shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
      {showLabel && (
        <span className="text-xs font-medium text-muted dark:text-muted-dark">
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </span>
      )}
    </button>
  );
}
