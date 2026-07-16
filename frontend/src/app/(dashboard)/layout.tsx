"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import PlasmaWave from "@/components/PlasmaWave";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* PlasmaWave background */}
      <div className="fixed inset-0 z-0 dark:opacity-30 opacity-10">
        <PlasmaWave
          colors={["#A855F7", "#06B6D4"]}
          speed1={0.05}
          speed2={0.05}
          focalLength={0.8}
          bend1={1}
          bend2={0.5}
        />
      </div>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-white/15 backdrop-blur-md border-b border-gray-200 dark:border-white/20 relative z-20">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">DotMatch</h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-900 dark:text-white p-1"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/80 dark:bg-white/15 backdrop-blur-md border-b border-gray-200 dark:border-white/20 relative z-20">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded text-sm font-medium ${
                  pathname === item.href
                    ? "bg-gray-200 dark:bg-white/20 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-white/80 dark:bg-white/15 backdrop-blur-md border-r border-gray-200 dark:border-white/20 flex-col relative z-10 shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-white/20 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">DotMatch</h1>
          <ThemeToggle />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded text-sm font-medium ${
                pathname === item.href
                  ? "bg-gray-200 dark:bg-white/20 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative z-10">{children}</main>
    </div>
  );
}
