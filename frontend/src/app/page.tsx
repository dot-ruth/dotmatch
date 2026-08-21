"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/Button";
import PlasmaWave from "@/components/PlasmaWave";

const jobBoards = [
  "RemoteOK", "We Work Remotely", "Remotive", "Arbeitnow",
  "Jobicy", "Findwork", "DevJobsScanner", "Himalayas",
  "FreeHire", "RemoteJobs.org", "JobsBase", "Lever", "Ashby", "Torre",
  "HN Hiring",
];

const features = [
  {
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    title: "All sources, one search",
    description: "15 job boards aggregated into a single, searchable feed. No tab switching.",
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Always fresh",
    description: "Sorted by posting date, not scrape date. See the newest roles first.",
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

const steps = [
  {
    step: "01",
    title: "We aggregate",
    description: "Our engine pulls fresh listings from 15 job boards every cycle. Deduplicated, filtered for dev roles only.",
  },
  {
    step: "02",
    title: "You search",
    description: "One search bar across all sources. Filter by remote, worldwide, salary, or keywords.",
  },
  {
    step: "03",
    title: "You match",
    description: "Upload your resume and we score every job against your skills. See your best matches ranked instantly.",
  },
];

const stats = [
  { value: "15", label: "Job sources" },
  { value: "100%", label: "Remote jobs" },
  { value: "0", label: "Ghost jobs" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-surface dark:bg-surface-dark overflow-hidden">
      {/* Full-page PlasmaWave background */}
      <div className="fixed inset-0 z-0" style={{ opacity: 0.12 }}>
        <PlasmaWave
          colors={["#1B4332", "#40916C"]}
          speed1={0.04}
          speed2={0.035}
          focalLength={0.8}
          bend1={1}
          bend2={0.5}
          dir2={1.0}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 lg:px-20 py-5 border-b border-border/50 dark:border-border-dark/50 backdrop-blur-sm">
          <Link href="/" className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
            Dot Match
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-6 lg:px-20 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="text-sm font-mono text-forest dark:text-forest-muted tracking-wider uppercase mb-6">
                  15 sources, one search
                </p>
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink dark:text-ink-dark leading-[1.05] mb-8">
                  Every remote
                  <br />
                  dev job.
                  <br />
                  <span className="text-forest dark:text-forest-muted">One place.</span>
                </h1>
                <p className="text-lg text-muted dark:text-muted-dark max-w-md mb-10 leading-relaxed">
                  Dot Match aggregates software engineering jobs from 15 boards so you
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

              <div className="relative max-w-md mx-auto w-full lg:max-w-none lg:mx-0">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-forest/10 dark:bg-forest-muted/10 rounded-2xl" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-ember/10 dark:bg-ember-muted/10 rounded-xl" />
                <div className="relative bg-surface-warm/80 dark:bg-surface-dark-warm/80 backdrop-blur-md border border-border dark:border-border-dark rounded-2xl p-6 shadow-card dark:shadow-none">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-3 h-3 rounded-full bg-ember/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                    <div className="w-3 h-3 rounded-full bg-forest/60" />
                    <span className="ml-2 text-xs font-mono text-subtle dark:text-subtle-dark">latest listings</span>
                  </div>
                  <div className="space-y-3">
                    <MockJobCard company="Stripe" title="Senior Backend Engineer" salary="$180k–$250k" tags={["Go", "PostgreSQL"]} />
                    <MockJobCard company="Vercel" title="Staff Frontend Engineer" salary="$200k–$280k" tags={["React", "TypeScript"]} />
                    <MockJobCard company="Linear" title="Full Stack Developer" salary="$150k–$200k" tags={["TypeScript", "React"]} />
                  </div>
                  <div className="mt-5 pt-4 border-t border-border dark:border-border-dark flex items-center justify-between">
                    <span className="text-xs font-mono text-subtle dark:text-subtle-dark">15 sources connected</span>
                    <span className="text-xs font-mono text-forest dark:text-forest-muted">live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section className="border-y border-border/50 dark:border-border-dark/50 backdrop-blur-sm overflow-hidden py-5">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...jobBoards, ...jobBoards, ...jobBoards].map((board, i) => (
              <span key={`${board}-${i}`} className="text-lg font-display font-medium text-ink/40 dark:text-ink-dark/40 select-none shrink-0">
                {board}
              </span>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 lg:px-20 py-20 lg:py-28">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-mono text-forest dark:text-forest-muted tracking-wider uppercase mb-4">
                How it works
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-ink dark:text-ink-dark">
                Three steps to your next role
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {steps.map((s) => (
                <div key={s.step} className="relative">
                  <span className="font-display text-7xl font-bold text-forest/20 dark:text-forest-muted/25 absolute -top-6 -left-2 select-none leading-none">
                    {s.step}
                  </span>
                  <div className="relative pt-12">
                    <h3 className="font-display text-xl font-semibold text-ink dark:text-ink-dark mb-3">
                      {s.title}
                    </h3>
                    <p className="text-sm text-muted dark:text-muted-dark leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why section */}
        <section className="px-6 lg:px-20 py-20 lg:py-28 border-t border-border/50 dark:border-border-dark/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <p className="text-sm font-mono text-forest dark:text-forest-muted tracking-wider uppercase mb-4">
                  Why Dot Match
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-ink dark:text-ink-dark leading-tight sticky top-8">
                  Job hunting shouldn&apos;t mean checking 15 tabs every morning.
                </h2>
              </div>
              <div className="lg:col-span-8">
                <div className="grid sm:grid-cols-2 gap-x-10 gap-y-12">
                  {features.map((f) => (
                    <Feature key={f.title} icon={f.icon} title={f.title} description={f.description} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 lg:px-20 py-16 border-t border-border/50 dark:border-border-dark/50">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl md:text-5xl font-bold text-forest dark:text-forest-muted mb-2">
                  {s.value}
                </p>
                <p className="text-sm font-mono text-muted dark:text-muted-dark uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Resume CTA */}
        <section className="px-6 lg:px-20 py-20 lg:py-28">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-surface-warm/80 dark:bg-surface-dark-warm/80 backdrop-blur-md border border-border dark:border-border-dark rounded-2xl p-10 lg:p-16 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-forest via-ember to-forest" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-forest/5 dark:bg-forest-muted/5 rounded-full" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-ember/5 dark:bg-ember-muted/5 rounded-full" />
              <h2 className="relative font-display text-3xl md:text-4xl font-bold text-ink dark:text-ink-dark mb-4">
                Stop browsing. Start matching.
              </h2>
              <p className="relative text-muted dark:text-muted-dark mb-8 text-lg max-w-lg mx-auto">
                Upload your resume and let our engine find the roles that fit your skills. No more guessing.
              </p>
              <div className="relative flex flex-wrap justify-center gap-3">
                <Link href="/resume">
                  <Button size="lg">Upload Resume</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="secondary" size="lg">Browse Jobs</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 lg:px-20 py-8 border-t border-border/50 dark:border-border-dark/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-display text-sm text-subtle dark:text-subtle-dark">Dot Match</span>
            <p className="text-xs text-subtle dark:text-subtle-dark">
              Aggregates public job listings. Not affiliated with any listed companies or job boards.
            </p>
          </div>
        </footer>
      </div>
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
      <h3 className="font-display text-lg font-semibold text-ink dark:text-ink-dark mb-2">{title}</h3>
      <p className="text-sm text-muted dark:text-muted-dark leading-relaxed">{description}</p>
    </div>
  );
}

function MockJobCard({ company, title, salary, tags }: { company: string; title: string; salary: string; tags: string[] }) {
  return (
    <div className="bg-surface/80 dark:bg-surface-dark/80 border border-border dark:border-border-dark rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink dark:text-ink-dark truncate">{title}</p>
          <p className="text-xs text-forest dark:text-forest-muted font-mono mt-0.5">{company}</p>
        </div>
        <span className="text-xs font-mono text-ember dark:text-ember-muted shrink-0">{salary}</span>
      </div>
      <div className="flex gap-1.5 mt-2">
        {tags.map((tag) => (
          <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-deep/80 dark:bg-surface-dark-deep/80 text-muted dark:text-muted-dark">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
