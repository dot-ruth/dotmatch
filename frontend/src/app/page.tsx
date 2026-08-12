"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import dynamic from "next/dynamic";

const FaultyTerminal = dynamic(() => import("@/components/FaultyTerminal"), {
  ssr: false,
});

const jobBoards = [
  "RemoteOK",
  "We Work Remotely",
  "Remotive",
  "Arbeitnow",
  "Jobicy",
  "Findwork",
  "HN Hiring",
  "Working Nomads",
  "DevJobsScanner",
  "Himalayas",
  "FreeHire",
  "RemoteJobs.org",
  "JobsBase",
  "Greenhouse",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper dark:bg-[#0C0A09]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-20 py-5 border-b border-paper-deep dark:border-[#292524]">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-semibold text-ink dark:text-[#F5F5F4]">
            DotMatch
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 lg:px-20 pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        {/* FaultyTerminal background */}
        <div className="absolute inset-0 z-0" style={{ opacity: 0.15 }}>
          <FaultyTerminal
            scale={2}
            gridMul={[2, 1]}
            digitSize={2}
            timeScale={0.4}
            pause={false}
            scanlineIntensity={0.5}
            glitchAmount={1}
            flickerAmount={0.8}
            noiseAmp={0.3}
            chromaticAberration={0}
            dither={0}
            curvature={0}
            tint="#1B4332"
            mouseReact={false}
            mouseStrength={0}
            pageLoadAnimation={true}
            brightness={0.6}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Text */}
            <div>
              <p className="text-sm font-mono text-forest dark:text-[#40916C] tracking-wider uppercase mb-6">
                14 sources, one search
              </p>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink dark:text-[#F5F5F4] leading-[1.05] mb-8">
                Every remote
                <br />
                dev job.
                <br />
                <span className="text-forest dark:text-[#40916C]">One place.</span>
              </h1>
              <p className="text-lg text-[#78716C] dark:text-[#A8A29E] max-w-md mb-10 leading-relaxed">
                DotMatch aggregates software engineering jobs from 14 boards so you
                don&apos;t have to check them all. Search, filter, apply.
              </p>
              <div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-forest text-paper rounded-lg hover:bg-forest-light font-medium transition-colors"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>

            {/* Right - Visual preview card */}
            <div className="relative hidden lg:block">
              {/* Decorative accent block */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-forest/10 dark:bg-[#40916C]/10 rounded-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-ember/10 dark:bg-[#FB923C]/10 rounded-xl" />

              {/* Main preview card */}
              <div className="relative bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] rounded-2xl p-6 shadow-card dark:shadow-none">
                {/* Card header */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-ember/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                  <div className="w-3 h-3 rounded-full bg-forest/60" />
                  <span className="ml-2 text-xs font-mono text-[#A8A29E]">latest listings</span>
                </div>

                {/* Mock job cards */}
                <div className="space-y-3">
                  <MockJobCard
                    company="Stripe"
                    title="Senior Backend Engineer"
                    salary="$180k–$250k"
                    tags={["Go", "PostgreSQL"]}
                  />
                  <MockJobCard
                    company="Vercel"
                    title="Staff Frontend Engineer"
                    salary="$200k–$280k"
                    tags={["React", "TypeScript"]}
                  />
                  <MockJobCard
                    company="Linear"
                    title="Full Stack Developer"
                    salary="$150k–$200k"
                    tags={["TypeScript", "React"]}
                  />
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-paper-deep dark:border-[#292524] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#A8A29E]">14 sources connected</span>
                  <span className="text-xs font-mono text-forest dark:text-[#40916C]">live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling job boards marquee */}
      <section className="border-y border-paper-deep dark:border-[#292524] bg-paper-warm dark:bg-[#1C1917] overflow-hidden py-5">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {[...jobBoards, ...jobBoards, ...jobBoards].map((board, i) => (
            <span
              key={`${board}-${i}`}
              className="text-lg font-display font-medium text-ink/20 dark:text-[#F5F5F4]/20 select-none shrink-0"
            >
              {board}
            </span>
          ))}
        </div>
      </section>

      {/* Why section */}
      <section className="px-6 lg:px-20 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left column - heading */}
            <div className="lg:col-span-4">
              <p className="text-sm font-mono text-forest dark:text-[#40916C] tracking-wider uppercase mb-4">
                Why DotMatch
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-ink dark:text-[#F5F5F4] leading-tight sticky top-8">
                Job hunting shouldn&apos;t mean checking 14 tabs every morning.
              </h2>
            </div>

            {/* Right column - features */}
            <div className="lg:col-span-8">
              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-12">
                <Feature
                  title="All sources, one search"
                  description="RemoteOK, WeWorkRemotely, Remotive, and 11 more — all searchable at once."
                />
                <Feature
                  title="Always fresh"
                  description="Jobs sorted by posting date, not scrape date. See the newest first."
                />
                <Feature
                  title="Dev-focused"
                  description="Only software engineering roles. No marketing, no sales, no design."
                />
                <Feature
                  title="Salary transparency"
                  description="When available, ranges displayed upfront. Filter by compensation."
                />
                <Feature
                  title="Clean interface"
                  description="No ads, no clutter. Light and dark themes. Built for speed."
                />
                <Feature
                  title="Truly remote"
                  description="Every source specializes in remote and distributed-first roles."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Matches theme */}
      <section className="px-6 lg:px-20 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] rounded-2xl p-10 lg:p-16 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-forest via-ember to-forest" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-forest/5 dark:bg-[#40916C]/5 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-ember/5 dark:bg-[#FB923C]/5 rounded-full" />

            <h2 className="relative font-display text-3xl md:text-4xl font-bold text-ink dark:text-[#F5F5F4] mb-4">
              Ready to find your next role?
            </h2>
            <p className="relative text-[#78716C] dark:text-[#A8A29E] mb-8 text-lg">
              Browse remote software engineering jobs right now.
            </p>
            <Link
              href="/dashboard"
              className="relative inline-flex items-center justify-center px-8 py-3.5 bg-forest text-paper rounded-lg hover:bg-forest-light font-medium transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-20 py-8 border-t border-paper-deep dark:border-[#292524]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm text-[#A8A29E]">DotMatch</span>
          <p className="text-xs text-[#A8A29E]">
            Aggregates public job listings. Not affiliated with any listed companies or job boards.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold text-ink dark:text-[#F5F5F4] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#78716C] dark:text-[#A8A29E] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function MockJobCard({
  company,
  title,
  salary,
  tags,
}: {
  company: string;
  title: string;
  salary: string;
  tags: string[];
}) {
  return (
    <div className="bg-paper dark:bg-[#0C0A09] border border-paper-deep dark:border-[#292524] rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink dark:text-[#F5F5F4] truncate">{title}</p>
          <p className="text-xs text-forest dark:text-[#40916C] font-mono mt-0.5">{company}</p>
        </div>
        <span className="text-xs font-mono text-ember dark:text-[#FB923C] shrink-0">{salary}</span>
      </div>
      <div className="flex gap-1.5 mt-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-paper-deep dark:bg-[#292524] text-[#78716C] dark:text-[#A8A29E]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
