"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/Button";
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
  "DevJobsScanner",
  "Himalayas",
  "FreeHire",
  "RemoteJobs.org",
  "JobsBase",
];

const features = [
  {
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    title: "All sources, one search",
    description: "RemoteOK, WeWorkRemotely, Remotive, and 9 more — all searchable at once.",
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Always fresh",
    description: "Jobs sorted by posting date, not scrape date. See the newest first.",
  },
  {
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    title: "Dev-focused",
    description: "Only software engineering roles. No marketing, no sales, no design.",
  },
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Salary transparency",
    description: "When available, ranges displayed upfront. Filter by compensation.",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "No ghost jobs",
    description: "Every listing links directly to the company's career page. No dead ends.",
  },
  {
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064",
    title: "Truly remote",
    description: "Filter for jobs open worldwide — work from Ethiopia or anywhere.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-20 py-5 border-b border-border dark:border-border-dark">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
            DotMatch
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex text-sm font-medium text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors duration-200"
          >
            Dashboard
          </Link>
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
              <p className="text-sm font-mono text-forest dark:text-forest-muted tracking-wider uppercase mb-6">
                11 sources, one search
              </p>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink dark:text-ink-dark leading-[1.05] mb-8">
                Every remote
                <br />
                dev job.
                <br />
                <span className="text-forest dark:text-forest-muted">One place.</span>
              </h1>
              <p className="text-lg text-muted dark:text-muted-dark max-w-md mb-10 leading-relaxed">
                DotMatch aggregates software engineering jobs from 11 boards so you
                don&apos;t have to check them all. Upload your resume for personalized matches.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard">
                  <Button size="lg">Browse Jobs</Button>
                </Link>
                <Link href="/resume">
                  <Button variant="secondary" size="lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Resume
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Visual preview card */}
            <div className="relative hidden lg:block">
              {/* Decorative accent block */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-forest/10 dark:bg-forest-muted/10 rounded-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-ember/10 dark:bg-ember-muted/10 rounded-xl" />

              {/* Main preview card */}
              <div className="relative bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark rounded-2xl p-6 shadow-card dark:shadow-none">
                {/* Card header */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-ember/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                  <div className="w-3 h-3 rounded-full bg-forest/60" />
                  <span className="ml-2 text-xs font-mono text-subtle dark:text-subtle-dark">latest listings</span>
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
                <div className="mt-5 pt-4 border-t border-border dark:border-border-dark flex items-center justify-between">
                  <span className="text-xs font-mono text-subtle dark:text-subtle-dark">11 sources connected</span>
                  <span className="text-xs font-mono text-forest dark:text-forest-muted">live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling job boards marquee */}
      <section className="border-y border-border dark:border-border-dark bg-surface-warm dark:bg-surface-dark-warm overflow-hidden py-5">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {[...jobBoards, ...jobBoards, ...jobBoards].map((board, i) => (
            <span
              key={`${board}-${i}`}
              className="text-lg font-display font-medium text-ink/20 dark:text-ink-dark/20 select-none shrink-0"
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
              <p className="text-sm font-mono text-forest dark:text-forest-muted tracking-wider uppercase mb-4">
                Why DotMatch
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-ink dark:text-ink-dark leading-tight sticky top-8">
                Job hunting shouldn&apos;t mean checking 11 tabs every morning.
              </h2>
            </div>

            {/* Right column - features */}
            <div className="lg:col-span-8">
              <div className="grid sm:grid-cols-2 gap-x-10 gap-y-12">
                {features.map((feature) => (
                  <Feature
                    key={feature.title}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-20 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark rounded-2xl p-10 lg:p-16 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-forest via-ember to-forest" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-forest/5 dark:bg-forest-muted/5 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-ember/5 dark:bg-ember-muted/5 rounded-full" />

            <h2 className="relative font-display text-3xl md:text-4xl font-bold text-ink dark:text-ink-dark mb-4">
              Ready to find your next role?
            </h2>
            <p className="relative text-muted dark:text-muted-dark mb-8 text-lg">
              Upload your resume or browse remote software engineering jobs right now.
            </p>
            <div className="relative flex flex-wrap justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg">Browse Jobs</Button>
              </Link>
              <Link href="/resume">
                <Button variant="secondary" size="lg">Upload Resume</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-20 py-8 border-t border-border dark:border-border-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm text-subtle dark:text-subtle-dark">DotMatch</span>
          <p className="text-xs text-subtle dark:text-subtle-dark">
            Aggregates public job listings. Not affiliated with any listed companies or job boards.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="group">
      <div className="w-10 h-10 rounded-xl bg-forest/10 dark:bg-forest-muted/10 flex items-center justify-center mb-4 group-hover:bg-forest/20 dark:group-hover:bg-forest-muted/20 transition-colors duration-200">
        <svg className="w-5 h-5 text-forest dark:text-forest-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink dark:text-ink-dark mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted dark:text-muted-dark leading-relaxed">
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
    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink dark:text-ink-dark truncate">{title}</p>
          <p className="text-xs text-forest dark:text-forest-muted font-mono mt-0.5">{company}</p>
        </div>
        <span className="text-xs font-mono text-ember dark:text-ember-muted shrink-0">{salary}</span>
      </div>
      <div className="flex gap-1.5 mt-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-deep dark:bg-surface-dark-deep text-muted dark:text-muted-dark"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
