"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/jobs", label: "Jobs", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { href: "/resume", label: "My Resume", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface dark:bg-surface-dark">
      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark sticky top-0 z-30">
        <Link href="/" className="font-display text-base font-semibold text-ink dark:text-ink-dark">
          Dot Match
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-surface-deep dark:hover:bg-surface-dark-deep transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg className="w-4 h-4 text-ink dark:text-ink-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark animate-fade-in">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-forest/10 text-forest dark:bg-forest-muted/10 dark:text-forest-muted"
                    : "text-muted dark:text-muted-dark hover:bg-surface-deep dark:hover:bg-surface-dark-deep"
                }`}
              >
                <svg className="w-4 h-4" fill={pathname === item.href ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border dark:border-border-dark shrink-0 transition-all duration-300 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border dark:border-border-dark h-14">
          {!collapsed ? (
            <Link href="/" className="pl-5 font-display text-base font-semibold text-ink dark:text-ink-dark">
              Dot Match
            </Link>
          ) : (
            <div className="w-2.5" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-surface-deep dark:hover:bg-surface-dark-deep transition-colors duration-200"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-4 h-4 text-muted dark:text-muted-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-forest/10 text-forest dark:bg-forest-muted/10 dark:text-forest-muted"
                    : "text-muted dark:text-muted-dark hover:bg-surface-deep dark:hover:bg-surface-dark-deep"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill={isActive ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border dark:border-border-dark p-3">
          <span className="text-xs font-mono text-subtle dark:text-subtle-dark">v1.0</span>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top bar — visible on all pages */}
        <header className="hidden md:flex items-center justify-end px-6 py-3 border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
          <ThemeToggle showLabel />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
