"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { GROTESK } from "@/lib/fonts";

/*
 * HOW IT WORKS — a pipeline, not four floating cards.
 * Layout: one row per step, joined by a dashed rail with a packet that
 * travels it in sequence. Each row's mini-visual demonstrates its step
 * (feed streams, query types itself, score counts up, apply presses).
 * Motion only starts when the row scrolls into view; everything falls
 * back to its resting state under prefers-reduced-motion (see globals.css).
 */

const QUERIES = ["Senior backend…", "React, worldwide…", "$150k+, remote…"];

interface Step {
  n: string;
  t: string;
  d: string;
  viz: ReactNode;
}

const STEPS: Step[] = [
  {
    n: "01",
    t: "Aggregate",
    d: "Software roles from 15 sources land in one feed. Cross-board duplicates merged, sorted by posted date.",
    viz: <VizAggregate />,
  },
  {
    n: "02",
    t: "Search",
    d: "One search bar across every source, plus a worldwide-only toggle.",
    viz: <VizSearch />,
  },
  {
    n: "03",
    t: "Match",
    d: "Upload your resume once. Roles are scored 0–100 against your skills.",
    viz: <VizMatch />,
  },
  {
    n: "04",
    t: "Apply",
    d: "Every listing links to the original posting — the source board or the employer's own form.",
    viz: <VizApply />,
  },
];

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function useInViewOnce<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* Step 1 — roles streaming into one feed */
function VizAggregate() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const rows = [
    { w: "w-24", c: "bg-forest dark:bg-forest-muted" },
    { w: "w-20", c: "bg-forest/60 dark:bg-forest-muted/60" },
    { w: "w-16", c: "bg-ember/70 dark:bg-ember-muted/70" },
  ];

  return (
    <div
      ref={ref}
      className={`rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1E1B18] p-3 shadow-[0_2px_12px_rgba(28,25,23,0.05)] ${inView ? "dm-play" : ""}`}
    >
      <div className="flex items-center justify-between mb-2 border-b border-border/70 dark:border-white/10 pb-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-subtle dark:text-subtle-dark">
          15 sources → 1 feed
        </span>
        <span className="font-mono text-[9px] font-bold text-forest dark:text-forest-muted tabular-nums">
          deduped
        </span>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.w}
          className="dm-feed-row flex items-center gap-2 py-[5px]"
          style={{ animationDelay: `${0.12 + i * 0.22}s` }}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.c}`} />
          <div className="min-w-0">
            <div className={`h-1.5 rounded-full bg-ink/15 dark:bg-white/15 ${r.w}`} />
            <div className="h-1.5 rounded-full bg-ink/10 dark:bg-white/10 w-12 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Step 2 — one query, typing itself out */
function VizSearch() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const [text, setText] = useState(QUERIES[0]);

  useEffect(() => {
    if (!inView || prefersReduced()) return;
    let idx = 0;
    let chars = QUERIES[0].length;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const current = QUERIES[idx];
      if (!deleting) {
        if (chars >= current.length) {
          deleting = true;
          timer = setTimeout(tick, 1600);
          return;
        }
        chars += 1;
        setText(current.slice(0, chars));
        timer = setTimeout(tick, 55);
        return;
      }
      if (chars <= 0) {
        deleting = false;
        idx = (idx + 1) % QUERIES.length;
        timer = setTimeout(tick, 350);
        return;
      }
      chars -= 1;
      setText(current.slice(0, chars));
      timer = setTimeout(tick, 28);
    };

    timer = setTimeout(tick, 1600);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [inView]);

  return (
    <div
      ref={ref}
      className="rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1E1B18] p-3 shadow-[0_2px_12px_rgba(28,25,23,0.05)]"
    >
      <div className="flex items-center gap-2 rounded-full border border-border dark:border-white/15 bg-surface dark:bg-white/[0.04] px-3.5 py-2">
        <svg
          className="w-3.5 h-3.5 text-muted dark:text-muted-dark shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
          />
        </svg>
        <span className="text-xs text-ink/70 dark:text-ink-dark/70 truncate min-w-0">
          {text}
        </span>
        <span
          aria-hidden="true"
          className="dm-caret inline-block h-3.5 w-[1.5px] shrink-0 bg-forest dark:bg-forest-muted"
        />
      </div>
      <div className="mt-2.5 flex justify-center gap-1.5">
        {["Worldwide", "Remote", "React"].map((c) => (
          <span
            key={c}
            className="font-mono text-[10px] px-2 py-1 rounded-md bg-surface-deep dark:bg-white/10 text-muted dark:text-muted-dark"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Step 3 — the score counting up against your skills */
function VizMatch() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReduced()) {
      setScore(92);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1100;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setScore(Math.round(92 * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1E1B18] p-4 text-center shadow-[0_2px_12px_rgba(28,25,23,0.05)]"
    >
      <p
        style={{ fontFamily: GROTESK }}
        className="font-bold text-[34px] leading-none text-forest dark:text-forest-muted tabular-nums"
      >
        {score}%
      </p>
      <div className="mt-2.5 h-2 rounded-full bg-surface-deep dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-forest dark:bg-forest-muted"
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="font-mono text-[10px] text-subtle dark:text-subtle-dark mt-1.5">
        12 skills matched
      </p>
    </div>
  );
}

/* Step 4 — press the button, land on the employer's own form */
function VizApply() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1E1B18] p-5 flex flex-col items-center gap-2 shadow-[0_2px_12px_rgba(28,25,23,0.05)]">
      <span className="dm-press inline-flex items-center gap-1.5 rounded-full bg-ink dark:bg-white px-6 py-2.5 text-[13px] font-bold text-white dark:text-ink">
        Apply now
      </span>
      <span className="dm-linkchip inline-flex items-center gap-1 font-mono text-[10px] text-forest dark:text-forest-muted">
        job-boards.greenhouse.io
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="dm-cursor absolute left-[58%] top-[46%] w-4 h-4 text-ink dark:text-white drop-shadow-sm"
      >
        <path d="M2 1 L2 13.2 L5.2 10.3 L7.3 14.6 L9.5 13.6 L7.4 9.5 L11.7 9.3 Z" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 lg:px-12 py-16 lg:py-24">
      <Reveal>
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-forest dark:text-forest-muted font-bold text-center">
          How it works
        </p>
        <h2
          style={{ fontFamily: GROTESK }}
          className="text-center font-bold tracking-tight text-[28px] sm:text-[36px] mt-2 text-balance"
        >
          Four steps to your next role
        </h2>
        <p className="mt-3 text-center text-[15px] text-muted dark:text-muted-dark max-w-[54ch] mx-auto leading-relaxed">
          Fifteen boards in, one link out — follow a job from the scrape to the
          application.
        </p>
      </Reveal>

      <ol className="mx-auto mt-12 max-w-4xl">
        {STEPS.map((s, i) => {
          const last = i === STEPS.length - 1;
          return (
            <li key={s.n}>
              <Reveal
                delay={i * 70}
                className={`group relative ${last ? "pb-2" : "pb-8 sm:pb-10"}`}
              >
                {!last && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[21px] top-[60px] bottom-0 border-l border-dashed border-ink/25 dark:border-white/15"
                  >
                    <span
                      className="dm-packet absolute left-0 -translate-x-1/2 h-[7px] w-[7px] rounded-full bg-forest dark:bg-forest-muted shadow-[0_0_10px_rgba(27,67,50,0.55)]"
                      style={{ animationDelay: `${i * 1.8}s` }}
                    />
                  </span>
                )}

                <div className="flex items-start gap-5 sm:gap-7 rounded-2xl py-3 transition-colors duration-200 group-hover:bg-surface-warm/70 dark:group-hover:bg-white/[0.03]">
                  <span
                    className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-white dark:bg-[#1E1B18] font-mono text-[11px] font-bold text-forest dark:text-forest-muted transition-all duration-200 border-ink/15 dark:border-white/15 group-hover:border-forest/60 group-hover:shadow-[0_0_0_4px_rgba(27,67,50,0.08)]"
                  >
                    {s.n}
                  </span>

                  <div className="relative min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-8">
                      <div className="min-w-0 sm:max-w-[40ch]">
                        <h3
                          style={{ fontFamily: GROTESK }}
                          className="font-bold text-[21px] tracking-tight text-ink dark:text-ink-dark transition-colors duration-200 group-hover:text-forest dark:group-hover:text-forest-muted"
                        >
                          {s.t}
                        </h3>
                        <p className="mt-2 text-[13.5px] leading-relaxed text-muted dark:text-muted-dark">
                          {s.d}
                        </p>
                      </div>
                      <div className="w-full sm:w-[260px] shrink-0">{s.viz}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
