"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/jobs",
    label: "Jobs",
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper dark:bg-[#0C0A09]">
      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-paper-deep dark:border-[#292524] bg-paper dark:bg-[#0C0A09] sticky top-0 z-30">
        <Link href="/" className="font-display text-base font-semibold text-ink dark:text-[#F5F5F4]">
          DotMatch
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-paper-deep dark:hover:bg-[#1C1917] transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-4 h-4 text-ink dark:text-[#D6D3D1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden border-b border-paper-deep dark:border-[#292524] bg-paper dark:bg-[#0C0A09]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-forest/10 text-forest dark:bg-[#40916C]/10 dark:text-[#40916C]"
                    : "text-[#78716C] dark:text-[#A8A29E] hover:bg-paper-warm dark:hover:bg-[#1C1917]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 flex-col border-r border-paper-deep dark:border-[#292524] shrink-0">
        <div className="p-5 border-b border-paper-deep dark:border-[#292524]">
          <Link href="/" className="font-display text-base font-semibold text-ink dark:text-[#F5F5F4]">
            DotMatch
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-forest/10 text-forest dark:bg-[#40916C]/10 dark:text-[#40916C]"
                  : "text-[#78716C] dark:text-[#A8A29E] hover:bg-paper-warm dark:hover:bg-[#1C1917]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-paper-deep dark:border-[#292524]">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <span className="text-xs font-mono text-[#A8A29E]">v1.0</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
