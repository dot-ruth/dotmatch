import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description:
    "Browse and search remote software engineering jobs. Filter by skills, company, and remote status.",
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
