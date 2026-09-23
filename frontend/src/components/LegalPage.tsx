"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { GROTESK } from "@/lib/fonts";

interface LegalPageProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

/** Shared shell for the legal pages (terms, privacy). */
export default function LegalPage({ eyebrow, title, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Logo />
      </div>
      <main id="main" className="mx-auto max-w-3xl px-6 pb-24">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted dark:text-muted-dark mb-4">
          {eyebrow}
        </p>
        <h1 style={{ fontFamily: GROTESK }} className="font-bold tracking-tight text-4xl md:text-5xl text-balance">
          {title}
        </h1>
        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted dark:text-muted-dark max-w-[62ch]">
          {children}
        </div>
        <Link
          href="/"
          style={{ fontFamily: GROTESK }}
          className="mt-12 inline-flex items-center bg-forest dark:bg-forest-muted text-white font-bold text-sm px-7 py-3 rounded-lg hover:bg-forest-light dark:hover:bg-forest-muted/90 active:translate-y-px transition-all duration-200"
        >
          Back home
        </Link>
      </main>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 style={{ fontFamily: GROTESK }} className="font-bold text-lg text-ink dark:text-ink-dark mb-2">
        {title}
      </h2>
      <p>{children}</p>
    </section>
  );
}
