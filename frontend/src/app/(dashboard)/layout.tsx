"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PlasmaWave from "@/components/PlasmaWave";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex relative">
      {/* PlasmaWave background */}
      <div className="fixed inset-0 z-0">
        <PlasmaWave
          colors={["#A855F7", "#06B6D4"]}
          speed1={0.05}
          speed2={0.05}
          focalLength={0.8}
          bend1={1}
          bend2={0.5}
        />
      </div>

      {/* Sidebar */}
      <aside className="w-56 bg-white/15 backdrop-blur-md border-r border-white/20 flex flex-col relative z-10">
        <div className="p-4 border-b border-white/20">
          <h1 className="text-lg font-bold text-white">DotMatch</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded text-sm font-medium ${
                pathname === item.href
                  ? "bg-white/20 text-white"
                  : "text-gray-200 hover:bg-white/10"
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
