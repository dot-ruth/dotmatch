import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DotMatch - AI Job Agent",
  description: "Remote software engineering jobs aggregated from multiple sources",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
