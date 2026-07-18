"use client";

import Link from "next/link";
import PlasmaWave from "@/components/PlasmaWave";
import ThemeToggle from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black relative">
      {/* PlasmaWave background */}
      <div className="fixed inset-0 z-0 dark:opacity-30 opacity-10">
        <PlasmaWave
          colors={["#A855F7", "#06B6D4"]}
          speed1={0.05}
          speed2={0.05}
          focalLength={0.8}
          bend1={1}
          bend2={0.5}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
        <span className="text-xl font-bold text-gray-900 dark:text-white">DotMatch</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 py-20 md:py-32 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Every remote dev job.
          <br />
          <span className="text-blue-600 dark:text-blue-400">One place.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          DotMatch aggregates software engineering jobs from 9+ boards so you
          don&apos;t have to check them all. Search, filter, and apply — instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
          >
            Browse Jobs
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-3 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 font-medium text-lg"
          >
            How it works
          </a>
        </div>
      </section>

      {/* Why DotMatch */}
      <section className="relative z-10 px-6 py-20 bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Why DotMatch?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Job hunting shouldn&apos;t mean checking 9 different tabs every morning.
            We built DotMatch so you can focus on applying, not searching.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<LinkIcon />}
              title="9 Sources, 1 Search"
              description="RemoteOK, WeWorkRemotely, Remotive, Arbeitnow, Jobicy, Findwork, HN Who's Hiring, Working Nomads, and DevJobsScanner — all searchable at once."
            />
            <FeatureCard
              icon={<ClockIcon />}
              title="Always Fresh"
              description="Jobs are sorted by when they were actually posted, not when we scraped them. See the newest listings first."
            />
            <FeatureCard
              icon={<SearchIcon />}
              title="Dev-Focused"
              description="Only software engineering jobs. No marketing, no sales, no design. Every listing is relevant to developers."
            />
            <FeatureCard
              icon={<MoonIcon />}
              title="Clean Interface"
              description="No ads, no clutter. Light and dark themes. Designed to help you find and apply to jobs quickly."
            />
            <FeatureCard
              icon={<DollarIcon />}
              title="Salary Transparency"
              description="When available, salary ranges are displayed upfront so you can filter by compensation."
            />
            <FeatureCard
              icon={<GlobeIcon />}
              title="Truly Remote"
              description="Every source we aggregate from specializes in remote and distributed-first roles."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step
              number={1}
              title="We collect"
              description="DotMatch pulls the latest job listings from 9 different remote job boards every time you hit Discover."
            />
            <Step
              number={2}
              title="You search"
              description="Filter by keywords, skills, company, or remote status. Results are sorted by posting date."
            />
            <Step
              number={3}
              title="You apply"
              description="Found one? Click through directly to the company's application page. No middleman."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to find your next role?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Browse {">"}200 remote software engineering jobs right now.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
          >
            Browse Jobs
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-gray-200 dark:border-white/10 text-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <p className="text-sm text-gray-500 dark:text-gray-500">
          DotMatch aggregates public job listings. We are not affiliated with any of the listed companies or job boards.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function LinkIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
}

function ClockIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function SearchIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}

function MoonIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
}

function DollarIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function GlobeIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
