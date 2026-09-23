"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import { GROTESK } from "@/lib/fonts";
import { SOURCE_NAMES as sources } from "@/lib/sources";

/*
 * Senior-pass rules for this page:
 * - Radius: buttons 8px, cards 16px, chips 6px. One rule, no exceptions.
 * - Accent lock: forest is the only accent (CTAs, status, key numerals).
 *   Supporting data stays neutral ink/muted. No second hue.
 * - Elevation: one ultra-faint natural shadow for floating cards, hairlines elsewhere.
 * - Motion: single restrained load fade + 200ms hover shifts. Nothing floats.
 */

const FLOAT_SHADOW = "shadow-[0_10px_28px_rgba(28,25,23,0.10),0_2px_6px_rgba(28,25,23,0.05)]";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/dashboard" },
  { label: "Match", href: "/resume" },
  { label: "Sources", href: "/dashboard" },
  { label: "Help", href: "/dashboard" },
  { label: "Contact", href: "/dashboard" },
];

const features = [
  { t: "All sources, one search", d: "Fifteen boards in a single feed. No tab switching, no duplicate posts." },
  { t: "Sorted by posted date", d: "Newest roles first, measured from the original posting — not the scrape." },
  { t: "Dev roles only", d: "Software engineering, filtered hard. No marketing, no sales, no design." },
  { t: "Salary up front", d: "Ranges shown when listed, so you never apply blind on compensation." },
  { t: "Direct apply links", d: "Every row links to the employer. No dead ends, no ghost jobs." },
  { t: "Worldwide filter", d: "One toggle for roles open anywhere. Work from Ethiopia — or anywhere." },
];

const sampleRanking = [
  { title: "Senior Backend Engineer", company: "Stripe", score: 92 },
  { title: "Staff Frontend Engineer", company: "Vercel", score: 87 },
  { title: "Full-Stack Developer", company: "Linear", score: 81 },
];

const faqs = [
  {
    q: "Is DotMatch free?",
    a: "Yes. Browsing, searching, and resume matching are all free, with no account required. There is nothing to sign up for.",
  },
  {
    q: "Where do the jobs come from?",
    a: "Public remote job boards — fifteen of them, including RemoteOK, We Work Remotely, and Remotive. Every listing links back to the original posting so you always apply at the source.",
  },
  {
    q: "Do I have to upload my resume?",
    a: "No. Browse and search freely without one. Uploading only matters if you want every job scored and ranked against your skills.",
  },
  {
    q: "How fresh are the listings?",
    a: "Jobs are sorted by their original posting date, newest first. Hit Discover Fresh Jobs on the dashboard any time to pull the latest from all sources.",
  },
];

export default function HomePage() {
  return (
    <main id="main" className="min-h-screen bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark">
      {/* NAV */}
      <header className="sticky top-0 z-40 bg-surface/85 dark:bg-surface-dark/85 backdrop-blur-md border-b border-border/60 dark:border-border-dark/60">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 lg:px-12 h-16">
          <Logo />
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-[13px] font-semibold text-ink/70 dark:text-ink-dark/70 hover:text-ink dark:hover:text-ink-dark transition-colors duration-200 rounded"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              style={{ fontFamily: GROTESK }}
              className="text-[13px] font-bold bg-forest dark:bg-forest-muted text-white px-5 py-2.5 rounded-lg hover:bg-forest-light dark:hover:bg-forest-muted/90 active:translate-y-px transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO — full viewport */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-[8%] w-[560px] h-[560px] rounded-full blur-3xl opacity-70 dark:opacity-20"
          style={{ background: "radial-gradient(circle, #DCE8DE 0%, transparent 65%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-140px] left-[-100px] w-[480px] h-[480px] rounded-full blur-3xl opacity-70 dark:opacity-10"
          style={{ background: "radial-gradient(circle, #F0E2C8 0%, transparent 65%)" }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12 min-h-[calc(100dvh-65px)] flex items-center py-12 lg:py-0">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-4 items-center w-full">
            {/* LEFT */}
            <div>
              <p className="rise rise-1 inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-forest dark:text-forest-muted font-bold mb-5">
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-forest-muted" />
                15 sources · one search
              </p>
              <h1
                style={{ fontFamily: GROTESK }}
                className="rise rise-2 font-bold tracking-[-0.03em] leading-[1.04] text-[44px] sm:text-[60px] xl:text-[72px] text-balance"
              >
                <span className="flex items-center gap-3 flex-wrap">
                  Let&apos;s Match
                  <span aria-hidden="true" className="inline-flex items-center justify-center w-[46px] h-[46px] sm:w-[54px] sm:h-[54px] rounded-full shrink-0"
                    style={{ background: "linear-gradient(135deg, #1B4332 0%, #40916C 100%)" }}>
                    <span className="w-6 h-6 rounded-full border-[3px] border-white/90 flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full" />
                    </span>
                  </span>
                  <svg aria-hidden="true" width="52" height="22" viewBox="0 0 52 22" fill="none" className="hidden sm:block text-ink dark:text-ink-dark">
                    <path d="M2 12 C 18 12, 30 12, 44 6 M36 2 L45 5.5 L38 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>

                <span className="flex items-center gap-4 mt-2 flex-wrap">
                  With
                  <span
                    aria-hidden="true"
                    className="inline-flex w-[68px] h-[50px] sm:w-[88px] sm:h-[62px] rounded-full overflow-hidden border-[2px] border-ink dark:border-ink-dark shrink-0 bg-[#E4B96F] items-center justify-center"
                  >
                    <span className="text-[20px] sm:text-[24px] text-white leading-none">★</span>
                  </span>
                  Hiring
                </span>

                <span className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="relative inline-block">
                    Remote&nbsp;Devs
                    <svg aria-hidden="true" viewBox="0 0 220 14" className="absolute -bottom-2 left-0 w-full h-[10px]" preserveAspectRatio="none">
                      <path d="M2 8 Q 12 3, 22 8 T 42 8 T 62 8 T 82 8 T 102 8 T 122 8 T 142 8 T 162 8 T 182 8 T 202 8 T 218 8" fill="none" stroke="#40916C" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M2 11 Q 12 6, 22 11 T 42 11 T 62 11 T 82 11 T 102 11 T 122 11 T 142 11 T 162 11 T 182 11 T 202 11 T 218 11" fill="none" stroke="#40916C" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                    </svg>
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full border-[1.8px] border-ink dark:border-ink-dark bg-white dark:bg-transparent shrink-0"
                  >
                    <span className="flex items-center">
                      <span className="w-7 h-[3px] bg-ink dark:bg-ink-dark rounded-full relative">
                        <span className="absolute left-1/2 -translate-x-1/2 -top-[5px] w-[13px] h-[13px] bg-ink dark:bg-ink-dark rounded-full border-2 border-white dark:border-surface-dark" />
                      </span>
                    </span>
                    <span className="flex -space-x-2 ml-2">
                      <span className="w-7 h-7 rounded-full border-2 border-white dark:border-surface-dark" style={{ background: "linear-gradient(135deg, #2D6A4F, #1B4332)" }} />
                      <span className="w-7 h-7 rounded-full border-2 border-white dark:border-surface-dark" style={{ background: "linear-gradient(135deg, #40916C, #2D6A4F)" }} />
                      <span className="w-7 h-7 rounded-full border-2 border-white dark:border-surface-dark bg-surface-deep dark:bg-white/20" />
                    </span>
                  </span>
                </span>
              </h1>

              <p className="rise rise-3 mt-7 text-[15px] leading-relaxed text-muted dark:text-muted-dark max-w-[420px]">
                Every remote dev job from 15 boards, ranked against your resume. Free, no login.
              </p>

              <div className="rise rise-4 mt-8 flex items-center gap-4 flex-wrap">
                <Link
                  href="/dashboard"
                  style={{ fontFamily: GROTESK }}
                  className="inline-flex items-center bg-forest dark:bg-forest-muted text-white font-bold text-[15px] px-9 py-4 rounded-lg hover:bg-forest-light dark:hover:bg-forest-muted/90 active:translate-y-px transition-all duration-200"
                >
                  Get Started
                </Link>
                {/* <div className="flex items-center gap-2 bg-[#EFD9BE] dark:bg-white/10 rounded-lg pl-3 pr-4 py-2.5">
                  <span className="relative flex w-2.5 h-2.5" aria-hidden="true">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-forest opacity-30 animate-ping" />
                    <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-forest dark:bg-forest-muted" />
                  </span>
                  <span className="text-[12px] font-bold">Fresh roles land daily</span>
                </div> */}
              </div>
            </div>

            {/* RIGHT — card collage (static, no floats) */}
            <div className="rise rise-5 relative h-[400px] sm:h-[440px] lg:h-[480px] select-none" aria-label="Job match collage">
              <svg aria-hidden="true" viewBox="0 0 120 90" className="absolute top-[130px] right-[100px] w-[100px] z-0 opacity-70 text-ink dark:text-ink-dark">
                <path d="M5 10 C 50 10, 80 20, 110 5 M10 40 C 45 40, 70 50, 100 38 M15 68 C 50 68, 75 75, 105 62" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              </svg>

              {/* Featured job card */}
              <Link
                href="/dashboard"
                className={`absolute left-0 sm:left-2 top-[4px] w-[248px] sm:w-[268px] bg-white dark:bg-[#1E1B18] rounded-2xl border border-border dark:border-white/10 ${FLOAT_SHADOW} p-4 z-10 -rotate-2 hover:rotate-0 transition-transform duration-200`}
                aria-label="Featured role: Senior Backend Engineer at Stripe. Open dashboard."
              >
                <span className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="relative inline-flex w-6 h-6">
                      <span className="absolute left-0 top-0 w-4 h-4 bg-forest dark:bg-forest-muted rounded-[2px]" />
                      <span className="absolute left-1.5 top-1 w-4 h-4 border-[1.2px] border-ink dark:border-ink-dark rounded-[2px]" />
                    </span>
                    <span style={{ fontFamily: GROTESK }} className="font-bold text-[13px]">Stripe</span>
                  </span>
                  <span className="text-[10px] font-bold bg-forest/10 dark:bg-forest-muted/15 text-forest dark:text-forest-muted px-2.5 py-1 rounded-md">Remote</span>
                </span>
                <span style={{ fontFamily: GROTESK }} className="block font-bold text-[19px] leading-snug">Senior Backend Engineer</span>
                <span className="block text-[12px] font-mono mt-1 tabular-nums">$180k–$250k</span>
                <span className="flex gap-1.5 mt-3">
                  {["Go", "PostgreSQL", "AWS"].map((t) => (
                    <span key={t} className="text-[10px] font-mono px-2 py-1 rounded-md bg-surface-warm dark:bg-white/5 text-muted dark:text-muted-dark">{t}</span>
                  ))}
                </span>
                <span className="block mt-3">
                  <span className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                    <span>Resume match</span>
                    <span className="font-mono text-forest dark:text-forest-muted tabular-nums">92%</span>
                  </span>
                  <span aria-hidden="true" className="block h-2 rounded-full bg-surface-deep dark:bg-white/10 overflow-hidden">
                    <span className="block h-full w-[92%] rounded-full bg-forest dark:bg-forest-muted" />
                  </span>
                </span>
              </Link>

              {/* Offer toast */}
              <div className={`absolute right-0 top-[176px] w-[188px] bg-white dark:bg-[#1E1B18] rounded-2xl border border-border dark:border-white/10 ${FLOAT_SHADOW} p-3.5 z-20 rotate-2`}>
                <p className="flex items-center gap-1.5 text-[12px] font-bold">
                  <span className="relative flex w-2 h-2" aria-hidden="true">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-forest dark:bg-forest-muted opacity-40 animate-ping" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-forest dark:bg-forest-muted" />
                  </span>
                  Offer received
                </p>
                <p className="text-[11px] text-muted dark:text-muted-dark mt-1 ml-3.5">Staff Frontend • Vercel</p>
              </div>

              {/* Sources card */}
              <div className="absolute left-0 sm:left-0 bottom-0 w-[196px] bg-surface-warm dark:bg-white/[0.06] rounded-2xl p-4 border border-border dark:border-white/10 z-10">
                <p style={{ fontFamily: GROTESK }} className="text-[13px] font-bold mb-3">Sources</p>
                <ul className="space-y-3">
                  <li>
                    <p className="text-[12px] font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-forest-muted" /> Senior Backend</p>
                    <p className="text-[10px] text-muted dark:text-muted-dark ml-3">Live • RemoteOK</p>
                  </li>
                  <li>
                    <p className="text-[12px] font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-forest/60 dark:bg-forest-muted/60" /> Frontend React</p>
                    <p className="text-[10px] text-muted dark:text-muted-dark ml-3">Live • WWR</p>
                  </li>
                  <li>
                    <p className="text-[12px] font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-forest/35 dark:bg-forest-muted/35" /> DevOps</p>
                    <p className="text-[10px] text-muted dark:text-muted-dark ml-3">Live • Remotive</p>
                  </li>
                </ul>
              </div>

              {/* Match score card */}
              <div className={`absolute left-[144px] sm:left-[162px] bottom-5 w-[172px] bg-white dark:bg-[#1E1B18] rounded-2xl border border-border dark:border-white/10 ${FLOAT_SHADOW} p-4 pt-8 text-center z-20`}>
                <span aria-hidden="true" className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-forest dark:bg-forest-muted border-[3px] border-white dark:border-[#1E1B18] flex items-center justify-center text-[18px] text-white">★</span>
                <div aria-hidden="true" className="flex justify-center gap-0.5 text-forest dark:text-forest-muted text-[13px]">★★★★★</div>
                <p style={{ fontFamily: GROTESK }} className="font-bold text-[18px] mt-1 tabular-nums">4.5</p>
                <p className="text-[10px] font-mono text-subtle dark:text-subtle-dark mb-3">sample match</p>
                <div className="space-y-1.5">
                  {[["Jan", "4.2"], ["Feb", "3.4"], ["March", "4.3"]].map(([m, s]) => (
                    <div key={m} className="flex items-center justify-between bg-surface-warm dark:bg-white/5 rounded-md px-2.5 py-1.5">
                      <span className="text-[11px] font-bold">{m}</span>
                      <span className="text-[11px] font-mono tabular-nums">{s} <span className="text-forest dark:text-forest-muted">★</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOURCES */}
      <div className="border-y border-border/60 dark:border-border-dark/60 py-4 overflow-hidden">
        <div className="flex gap-10 animate-marquee whitespace-nowrap w-max">
          {[...sources, ...sources, ...sources].map((s, i) => (
            <span key={`${s}-${i}`} style={{ fontFamily: GROTESK }} className="text-[15px] font-bold text-ink/30 dark:text-ink-dark/30 shrink-0">
              {s} <span className="ml-8 text-forest dark:text-forest-muted">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* HOW */}
      <section className="mx-auto max-w-7xl px-6 lg:px-12 py-16 lg:py-24">
        <Reveal>
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-forest dark:text-forest-muted font-bold text-center">How it works</p>
          <h2 style={{ fontFamily: GROTESK }} className="text-center font-bold tracking-tight text-[28px] sm:text-[36px] mt-2 text-balance">Three steps to hired</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {[
            { n: "01", t: "We aggregate", d: "Fresh software roles pulled from 15 boards every cycle. Deduplicated, dev-only." },
            { n: "02", t: "You search", d: "One search bar across every source. Filter worldwide, salary, stack." },
            { n: "03", t: "You match", d: "Upload your resume and get every job scored against your skills." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div className="rounded-2xl border border-border dark:border-border-dark bg-surface-warm dark:bg-white/[0.03] p-6 relative overflow-hidden h-full">
                <span aria-hidden="true" className="absolute -top-1 right-3 text-[64px] font-bold opacity-10" style={{ fontFamily: GROTESK }}>{s.n}</span>
                <h3 style={{ fontFamily: GROTESK }} className="font-bold text-[18px]">{s.t}</h3>
                <p className="text-[13px] text-muted dark:text-muted-dark mt-2 leading-relaxed">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-7xl px-6 lg:px-12 py-16 lg:py-24 border-t border-border/60 dark:border-border-dark/60">
        <Reveal>
          <h2 style={{ fontFamily: GROTESK }} className="font-bold tracking-tight text-[28px] sm:text-[36px] text-balance max-w-[20ch]">
            Job hunting shouldn&apos;t mean checking fifteen tabs every morning.
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 mt-12">
          {features.map((f, i) => (
            <Reveal key={f.t} delay={Math.min(i * 60, 180)}>
              <div>
                <p aria-hidden="true" className="font-mono text-xs text-forest dark:text-forest-muted tabular-nums mb-3">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 style={{ fontFamily: GROTESK }} className="font-bold text-[17px]">{f.t}</h3>
                <p className="text-sm text-muted dark:text-muted-dark mt-2 leading-relaxed">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* MATCH */}
      <section className="border-y border-border/60 dark:border-border-dark/60 bg-surface-warm/60 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <h2 style={{ fontFamily: GROTESK }} className="font-bold tracking-tight text-[28px] sm:text-[36px] text-balance">
                Stop browsing. Start matching.
              </h2>
              <p className="mt-4 text-[15px] text-muted dark:text-muted-dark leading-relaxed max-w-[46ch]">
                Upload your resume once. DotMatch extracts your skills and scores every open role
                against them, so the best fits rise to the top with the evidence attached.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {["Skills detected automatically", "Every job scored 0–100", "Matched skills shown per role"].map((li) => (
                  <li key={li} className="flex items-center gap-2.5">
                    <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-forest-muted shrink-0" />
                    <span className="font-medium">{li}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/resume"
                style={{ fontFamily: GROTESK }}
                className="mt-8 inline-flex items-center bg-forest dark:bg-forest-muted text-white font-bold text-sm px-7 py-3.5 rounded-lg hover:bg-forest-light dark:hover:bg-forest-muted/90 active:translate-y-px transition-all duration-200"
              >
                Upload Resume
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className={`bg-white dark:bg-[#1E1B18] rounded-2xl border border-border dark:border-white/10 ${FLOAT_SHADOW} p-5 sm:p-6`}>
              <div className="flex items-center justify-between mb-4">
                <p style={{ fontFamily: GROTESK }} className="font-bold text-[15px]">Your ranking</p>
                <p className="font-mono text-[11px] text-subtle dark:text-subtle-dark">sample · 12 skills detected</p>
              </div>
              <div className="space-y-4">
                {sampleRanking.map((r, i) => (
                  <div key={r.title}>
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <p className="text-sm font-semibold truncate">
                        {r.title} <span className="font-normal text-muted dark:text-muted-dark">· {r.company}</span>
                      </p>
                      <p className="font-mono text-sm font-bold text-forest dark:text-forest-muted tabular-nums shrink-0">#{i + 1}</p>
                    </div>
                    <div aria-hidden="true" className="h-2 rounded-full bg-surface-deep dark:bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-forest dark:bg-forest-muted" style={{ width: `${r.score}%` }} />
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-subtle dark:text-subtle-dark tabular-nums">{r.score} / 100 match</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 lg:px-12 py-16 lg:py-24">
        <Reveal>
          <h2 style={{ fontFamily: GROTESK }} className="font-bold tracking-tight text-[28px] sm:text-[36px] text-balance text-center">
            Fair questions.
          </h2>
        </Reveal>
        <div className="mt-10">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={Math.min(i * 50, 150)}>
              <details className="group border-t border-border dark:border-border-dark last:border-b py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-[15px] rounded focus-visible:outline-2 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden="true" className="font-mono text-muted dark:text-muted-dark transition-transform duration-200 group-open:rotate-45 shrink-0">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted dark:text-muted-dark leading-relaxed max-w-[62ch]">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 lg:px-12 pb-14">
        <Reveal>
          <div className="bg-forest dark:bg-[#123026] text-[#F5F0EB] rounded-2xl px-8 py-14 text-center relative overflow-hidden">
            <h2 style={{ fontFamily: GROTESK }} className="relative font-bold tracking-tight text-[30px] sm:text-[40px] text-balance">Stop tab-hoarding. Start matching.</h2>
            <p className="relative opacity-70 text-[15px] mt-3 max-w-[460px] mx-auto leading-relaxed">Upload your resume once. See your best remote dev matches ranked instantly with direct apply links.</p>
            <div className="relative flex justify-center gap-3 mt-8 flex-wrap">
              <Link href="/resume" style={{ fontFamily: GROTESK }} className="bg-[#F5F0EB] text-forest font-bold text-[14px] px-8 py-3.5 rounded-lg hover:bg-white active:translate-y-px transition-all duration-200">Upload Resume</Link>
              <Link href="/dashboard" style={{ fontFamily: GROTESK }} className="border border-white/30 font-bold text-[14px] px-8 py-3.5 rounded-lg hover:bg-white/10 active:translate-y-px transition-all duration-200">Browse Jobs</Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border/60 dark:border-border-dark/60">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 pt-14 pb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
              <Logo />
              <div className="flex gap-16 sm:gap-24">
                <nav aria-label="Navigate">
                  <p className="font-bold text-[15px] mb-4">Navigate</p>
                  <ul className="space-y-3">
                    {[
                      { label: "Jobs", href: "/dashboard" },
                      { label: "Match", href: "/resume" },
                      { label: "How it works", href: "#how" },
                      { label: "Sources", href: "#sources" },
                    ].map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className="text-[15px] text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors duration-200 rounded">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <nav aria-label="Terms and policies">
                  <p className="font-bold text-[15px] mb-4">Terms &amp; Policies</p>
                  <ul className="space-y-3">
                    {[
                      { label: "Terms of Use", href: "/terms" },
                      { label: "Privacy Policy", href: "/privacy" },
                    ].map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className="text-[15px] text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors duration-200 rounded">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
            <svg
              aria-hidden="true"
              viewBox="0 0 1200 240"
              className="mt-14 w-full h-auto select-none text-ink dark:text-ink-dark"
              role="presentation"
            >
              <defs>
                <filter id="dm-edge" x="-5%" y="-5%" width="110%" height="110%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.015 0.045" numOctaves="2" seed="7" result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale="6" />
                </filter>
                <filter id="dm-speckle" x="0%" y="0%" width="100%" height="100%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="11" stitchTiles="stitch" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 1.5 1.5 0 -2"
                  />
                </filter>
                <mask id="dm-textmask" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="240">
                  <text
                    x="600"
                    y="196"
                    textAnchor="middle"
                    fontFamily="'Instrument Serif', Georgia, serif"
                    fontSize="212"
                    letterSpacing="-2"
                    fill="#ffffff"
                  >
                    DotMatch
                  </text>
                </mask>
              </defs>
              <g filter="url(#dm-edge)">
                <text
                  x="600"
                  y="196"
                  textAnchor="middle"
                  fontFamily="'Instrument Serif', Georgia, serif"
                  fontSize="212"
                  letterSpacing="-2"
                  fill="currentColor"
                >
                  DotMatch
                </text>
                <rect x="0" y="0" width="1200" height="240" filter="url(#dm-speckle)" opacity="0.5" mask="url(#dm-textmask)" />
              </g>
            </svg>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-subtle dark:text-subtle-dark">© 2026 DotMatch</span>
              <p className="font-mono text-[11px] text-subtle dark:text-subtle-dark text-center">Aggregates public listings. Not affiliated with any board or employer.</p>
            </div>
          </div>
      </footer>
    </main>
  );
}
