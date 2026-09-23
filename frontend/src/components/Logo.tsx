"use client";

import Link from "next/link";

import { GROTESK } from "@/lib/fonts";

interface LogoProps {
  markOnly?: boolean;
  className?: string;
}

/**
 * Shared DotMatch brand mark — forest square overlapped by an ink
 * outline square, paired with a grotesk wordmark. Used on the
 * landing page and across the app for one consistent identity.
 */
export default function Logo({ markOnly = false, className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 shrink-0 rounded focus-visible:outline-2 ${className}`}
      aria-label="DotMatch home"
    >
      <span className="relative inline-flex w-7 h-7" aria-hidden="true">
        <span className="absolute left-0 top-0 w-5 h-5 bg-forest dark:bg-forest-muted rounded-[3px]" />
        <span className="absolute left-2 top-1.5 w-5 h-5 border-[1.5px] border-ink dark:border-ink-dark rounded-[3px]" />
      </span>
      {!markOnly && (
        <span
          style={{ fontFamily: GROTESK }}
          className="font-bold text-[17px] tracking-tight text-ink dark:text-ink-dark"
        >
          DotMatch
        </span>
      )}
    </Link>
  );
}
