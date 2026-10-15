"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, Job, formatDateFull, formatDeadline, formatSalary } from "@/lib/api";
import { detectAts } from "@/lib/ats";
import { Deck, deckFromJobs, loadDeck, saveDeck } from "@/lib/deck";
import { JobSections, derivedRequirements, parseJobSections } from "@/lib/jobContent";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { notifyAppliedChanged } from "@/components/AppliedDrawer";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [navError, setNavError] = useState<string | null>(null);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [index, setIndex] = useState(-1);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [sections, setSections] = useState<JobSections | null>(null);
  const [shellTop, setShellTop] = useState(0);
  const [appliedBusy, setAppliedBusy] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [cover, setCover] = useState<"closed" | "loading" | "open">("closed");
  const [coverText, setCoverText] = useState("");
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverCopied, setCoverCopied] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const jobsCache = useRef<Map<string, Job>>(new Map());
  const deckRef = useRef<Deck | null>(null);
  const jobRef = useRef<Job | null>(null);
  const indexRef = useRef(-1);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function commitDeck(next: Deck) {
    deckRef.current = next;
    setDeck(next);
  }

  function commitIndex(next: number) {
    indexRef.current = next;
    setIndex(next);
  }

  useEffect(() => {
    jobRef.current = job;
  }, [job]);

  /* Fit the page to the viewport so the job itself scrolls inside the page. */
  useEffect(() => {
    const measure = () => {
      const el = rootRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setShellTop(top);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* Deck: the list the user was browsing, so left/right follows that order. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = loadDeck();
      if (saved) {
        commitDeck(saved);
        return;
      }
      try {
        const res = await api.getJobs({ limit: 100 });
        if (cancelled) return;
        (res.items || []).forEach((j) => jobsCache.current.set(j.id, j));
        commitDeck(
          deckFromJobs(
            (res.items || []).map((j) => j.id),
            { limit: 100 },
            res.total || (res.items || []).length,
          ),
        );
      } catch {
        /* no deck — the current job still opens on its own */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Load the job for the current URL and line up the deck index. */
  useEffect(() => {
    let cancelled = false;
    setNavError(null);
    setApplyError(null);
    setCover("closed");
    setCoverText("");
    setCoverError(null);

    const cached = jobsCache.current.get(id);
    if (cached) {
      setJob(cached);
      setSections(parseJobSections(cached));
      setLoading(false);
      setNavigating(false);
    } else {
      if (!jobRef.current) setLoading(true);
      else setNavigating(true);
      api
        .getJob(id)
        .then((fresh) => {
          if (cancelled) return;
          jobsCache.current.set(id, fresh);
          setJob(fresh);
          setSections(parseJobSections(fresh));
        })
        .catch(() => {
          if (cancelled) return;
          if (jobRef.current) setNavError("That job could not be loaded. Showing the previous one.");
          else setLoadError("We couldn't load this job. It may be temporarily unavailable.");
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
          setNavigating(false);
        });
    }

    const currentDeck = deckRef.current;
    if (currentDeck) {
      let idx = currentDeck.ids.indexOf(id);
      if (idx === -1) {
        currentDeck.ids = [id, ...currentDeck.ids.filter((x) => x !== id)];
        commitDeck(currentDeck);
        idx = 0;
      }
      commitIndex(idx);
    }

    scrollRef.current?.scrollTo({ top: 0 });
    if (window.scrollY > 0) window.scrollTo({ top: 0 });

    return () => {
      cancelled = true;
    };
  }, [id, deck]);

  async function loadMore(): Promise<boolean> {
    const current = deckRef.current;
    if (!current || current.ids.length >= current.total) return false;
    try {
      let fetched: Job[] = [];
      if (current.kind === "matched") {
        const res = await api.getMatchedJobs({ limit: current.limit, offset: current.ids.length });
        fetched = (res || []).map((m) => m.job);
      } else {
        const res = await api.getJobs({
          ...current.params,
          offset: current.ids.length,
          limit: current.limit,
        });
        fetched = res.items || [];
      }
      if (fetched.length === 0) return false;
      fetched.forEach((j) => jobsCache.current.set(j.id, j));
      const next: Deck = {
        ...current,
        ids: [...current.ids, ...fetched.map((j) => j.id)],
        total: Math.max(current.total, current.ids.length + fetched.length),
      };
      commitDeck(next);
      saveDeck(next);
      return true;
    } catch {
      return false;
    }
  }

  async function goTo(delta: number) {
    const current = deckRef.current;
    if (!current || navigating) return;
    const from = indexRef.current;
    let target = (from === -1 ? 0 : from) + delta;
    if (target < 0) target = 0;
    if (target === from) return;
    if (target >= current.ids.length) {
      const hasMore = await loadMore();
      if (!hasMore) return;
    }
    const ids = deckRef.current?.ids || [];
    if (target >= ids.length) return;
    setDirection(delta >= 0 ? "next" : "prev");
    setNavError(null);
    router.replace(`/jobs/${ids[target]}`, { scroll: false });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        void goTo(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        void goTo(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      void goTo(dx < 0 ? 1 : -1);
    }
  }

  function commitUpdated(updated: Job) {
    jobsCache.current.set(updated.id, updated);
    if (jobRef.current?.id === updated.id) setJob(updated);
  }

  async function toggleApplied() {
    const current = jobRef.current;
    if (!current || appliedBusy) return;
    setAppliedBusy(true);
    setApplyError(null);
    try {
      const next = current.applied_at
        ? await api.unmarkApplied(current.id)
        : await api.markApplied(current.id);
      commitUpdated(next);
      notifyAppliedChanged();
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Could not update this job.");
    } finally {
      setAppliedBusy(false);
    }
  }

  async function draftCoverLetter() {
    const current = jobRef.current;
    if (!current) return;
    setCover("loading");
    setCoverError(null);
    try {
      const bullets = sections?.requirements?.length
        ? sections.requirements
        : derivedRequirements(current);
      const res = await api.draftCoverLetter({
        job_id: current.id,
        requirements: bullets.slice(0, 6),
      });
      setCoverText(res.text);
      setCover("open");
    } catch (err) {
      setCover("closed");
      setCoverError(err instanceof Error ? err.message : "Could not draft a cover letter.");
    }
  }

  async function copyCoverLetter() {
    try {
      await navigator.clipboard.writeText(coverText);
      setCoverCopied(true);
      window.setTimeout(() => setCoverCopied(false), 1600);
    } catch {
      setCoverError("Clipboard access was blocked — select the text and copy manually.");
    }
  }

  const deadline = job ? formatDeadline(job.deadline) : null;
  const salary = job ? formatSalary(job.salary_min, job.salary_max) : null;
  const posted = job ? formatDateFull(job.posted_at) : null;
  const appliedOn = job ? formatDateFull(job.applied_at) : null;
  const ats = job ? detectAts(job.url) : null;
  const position = index >= 0 ? index + 1 : null;
  const progress = deck && position ? Math.min(100, (position / Math.max(deck.total, 1)) * 100) : 0;

  if (loadError && !job) {
    return (
      <div className="p-6 lg:p-10 min-h-screen animate-fade-in">
        <div className="max-w-xl p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert">
          <h1 className="font-display text-xl font-semibold mb-2">Job details unavailable</h1>
          <p className="text-sm mb-5">{loadError}</p>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>Retry</Button>
            <Button size="sm" variant="ghost" onClick={() => router.push("/jobs")}>Back to jobs</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col bg-surface dark:bg-surface-dark"
      style={{ height: `calc(100dvh - ${shellTop}px)` }}
    >
      {/* Structured data */}
      {job && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "JobPosting",
              title: job.title,
              description: job.description?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
              datePosted: job.posted_at || job.created_at,
              validThrough: job.deadline || undefined,
              hiringOrganization: {
                "@type": "Organization",
                name: job.company?.name || "Unknown",
              },
              jobLocation: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: job.location || "Remote",
                },
              },
              employmentType: job.employment_type || undefined,
              jobLocationType: job.remote ? "TELECOMMUTE" : undefined,
              applicantLocationRequirements: job.remote ? "Worldwide" : undefined,
              skills: job.skills,
              identifier: {
                "@type": "PropertyValue",
                name: "Dot Match",
                value: job.id,
              },
            }),
          }}
        />
      )}

      {/* Sticky bar: browse controls stay put while the job scrolls */}
      <div className="shrink-0 relative z-30 border-b border-border dark:border-border-dark bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-10 py-3">
          <button
            onClick={() => router.push("/jobs")}
            className="inline-flex items-center gap-1.5 text-sm text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors shrink-0 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            <span className="hidden sm:inline">Jobs</span>
          </button>

          <p className="hidden md:block truncate text-sm font-medium text-ink dark:text-ink-dark min-w-0">
            {job?.title}
          </p>

          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-xs text-subtle dark:text-subtle-dark tabular-nums shrink-0">
              {navigating ? "…" : position && deck ? `${position} / ${deck.total}` : ""}
            </span>
            <button
              onClick={() => void goTo(-1)}
              disabled={!deck || index <= 0}
              aria-label="Previous job"
              title="Previous job (←)"
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-border dark:border-border-dark bg-surface-warm dark:bg-surface-dark-warm text-ink dark:text-ink-dark hover:bg-surface-deep dark:hover:bg-surface-dark-deep disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => void goTo(1)}
              disabled={!deck || (deck && index >= deck.ids.length - 1 && index >= deck.total - 1)}
              aria-label="Next job"
              title="Next job (→)"
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-border dark:border-border-dark bg-surface-warm dark:bg-surface-dark-warm text-ink dark:text-ink-dark hover:bg-surface-deep dark:hover:bg-surface-dark-deep disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {job?.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest/90 text-sm font-medium transition-all shrink-0"
              >
                Apply
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
        <div className="h-0.5 bg-surface-deep dark:bg-surface-dark-deep">
          <div
            className="h-full bg-forest dark:bg-forest-muted transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {navError && (
          <p className="px-4 sm:px-6 lg:px-10 py-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30" role="alert">
            {navError}
          </p>
        )}
      </div>

      {/* Desktop edge controls */}
      <button
        onClick={() => void goTo(-1)}
        disabled={!deck || index <= 0}
        aria-label="Previous job"
        className="hidden xl:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full border border-border dark:border-border-dark bg-surface/90 dark:bg-surface-dark/90 backdrop-blur text-ink dark:text-ink-dark shadow-card disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-deep dark:hover:bg-surface-dark-deep transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => void goTo(1)}
        disabled={!deck || (index >= deck.ids.length - 1 && index >= deck.total - 1)}
        aria-label="Next job"
        className="hidden xl:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full border border-border dark:border-border-dark bg-surface/90 dark:bg-surface-dark/90 backdrop-blur text-ink dark:text-ink-dark shadow-card disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-deep dark:hover:bg-surface-dark-deep transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Scrollable job content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {loading && !job ? (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-6">
            <div className="h-4 w-40 bg-surface-warm dark:bg-surface-dark-warm rounded shimmer" />
            <div className="h-9 w-3/4 bg-surface-warm dark:bg-surface-dark-warm rounded-lg shimmer" />
            <div className="h-4 w-64 bg-surface-warm dark:bg-surface-dark-warm rounded shimmer" />
            <div className="h-64 bg-surface-warm dark:bg-surface-dark-warm rounded-xl shimmer" />
          </div>
        ) : job ? (
          <article
            key={job.id}
            className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 ${
              direction === "next" ? "slide-next" : "slide-prev"
            }`}
          >
            {/* Title (posted on – deadline) */}
            <header>
              <p className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-forest dark:text-forest-muted font-bold mb-3">
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-forest-muted" />
                {job.source_type ? `via ${job.source_type}` : "Job posting"}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-ink-dark leading-tight mb-3">
                {job.title}
              </h1>
              <p className="text-sm text-muted dark:text-muted-dark mb-4">
                {posted && <span>Posted {posted}</span>}
                {deadline && (
                  <>
                    {posted && <span className="text-subtle dark:text-subtle-dark"> — </span>}
                    <span className={deadline.closed ? "text-red-600 dark:text-red-400 font-medium" : "text-ember dark:text-ember-muted font-medium"}>
                      Deadline {deadline.label}
                      {deadline.closed ? " (closed)" : ""}
                    </span>
                  </>
                )}
                {!posted && !deadline && <span>Posting date not listed</span>}
                {appliedOn && (
                  <span className="text-forest dark:text-forest-muted font-medium">
                    {posted || deadline ? " — " : ""}Applied {appliedOn}
                  </span>
                )}
              </p>
              <p className="text-sm text-muted dark:text-muted-dark">
                <span className="text-forest dark:text-forest-muted font-medium">
                  {job.company?.name || "Unknown Company"}
                </span>
                {job.location && <span className="text-subtle dark:text-subtle-dark"> · {job.location}</span>}
                {job.remote && <span className="text-forest/70 dark:text-forest-muted/70"> · Remote</span>}
              </p>
            </header>

            {/* Facts */}
            <div className="flex flex-wrap items-center gap-2 mt-5">
              {salary && <Badge variant="ember">{salary}</Badge>}
              {job.experience_level && <Badge>{job.experience_level}</Badge>}
              {job.employment_type && <Badge>{job.employment_type}</Badge>}
              {job.remote && <Badge variant="forest">Worldwide eligible</Badge>}
              {appliedOn && <Badge variant="forest">Applied</Badge>}
              {ats && <Badge variant="muted">{ats.label} form</Badge>}
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-mono text-subtle dark:text-subtle-dark uppercase tracking-wider mb-3">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="my-8 h-px bg-border dark:bg-border-dark" />

            {/* What the job is about */}
            <section className="mb-10">
              <h2 className="font-display text-lg sm:text-xl font-bold text-ink dark:text-ink-dark mb-4">
                What the job is about
              </h2>
              {sections && sections.about.length > 0 ? (
                <div
                  className="text-sm job-description"
                  dangerouslySetInnerHTML={{ __html: sections.about.join("") }}
                />
              ) : sections ? (
                <p className="text-sm text-muted dark:text-muted-dark">
                  The employer did not include a description for this posting.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="h-4 w-full bg-surface-warm dark:bg-surface-dark-warm rounded shimmer" />
                  <div className="h-4 w-11/12 bg-surface-warm dark:bg-surface-dark-warm rounded shimmer" />
                  <div className="h-4 w-4/5 bg-surface-warm dark:bg-surface-dark-warm rounded shimmer" />
                </div>
              )}
            </section>

            {/* What it requires */}
            <section className="mb-10">
              <h2 className="font-display text-lg sm:text-xl font-bold text-ink dark:text-ink-dark mb-4">
                What it requires
              </h2>
              {sections && sections.requirements.length > 0 ? (
                <ul className="space-y-2.5">
                  {sections.requirements.map((item, i) => (
                    <li key={`${i}-${item.slice(0, 24)}`} className="flex gap-3 text-sm text-muted dark:text-muted-dark leading-relaxed">
                      <span aria-hidden="true" className="mt-2 w-1.5 h-1.5 rounded-full bg-forest dark:bg-forest-muted shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : sections ? (
                <div>
                  <ul className="space-y-2.5">
                    {derivedRequirements(job).map((item) => (
                      <li key={item} className="flex gap-3 text-sm text-muted dark:text-muted-dark leading-relaxed">
                        <span aria-hidden="true" className="mt-2 w-1.5 h-1.5 rounded-full bg-forest dark:bg-forest-muted shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-subtle dark:text-subtle-dark">
                    No explicit requirements section in this posting — these come from the listed skills, level, and location.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-4 w-10/12 bg-surface-warm dark:bg-surface-dark-warm rounded shimmer" />
                  <div className="h-4 w-9/12 bg-surface-warm dark:bg-surface-dark-warm rounded shimmer" />
                </div>
              )}
            </section>

            {/* Apply + track + draft */}
            <div className="mb-10 p-5 rounded-xl border border-border dark:border-border-dark bg-surface-warm dark:bg-surface-dark-warm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <p className="text-sm text-muted dark:text-muted-dark">
                  {ats
                    ? `Applications are handled by the employer at ${ats.host} (${ats.label} application form).`
                    : "Applications are handled by the employer on their own site."}
                </p>
                {ats && <Badge variant="muted">{ats.label} form</Badge>}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 text-sm font-medium transition-all"
                  >
                    Apply for this job
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                <Button variant="secondary" loading={appliedBusy} onClick={() => void toggleApplied()}>
                  {appliedOn ? `Applied ${appliedOn} — undo` : "Mark as applied"}
                </Button>
              </div>

              {ats && (
                <p className="mt-3 text-xs text-subtle dark:text-subtle-dark">{ats.hint}</p>
              )}
              {applyError && (
                <p role="alert" className="mt-3 text-xs text-red-600 dark:text-red-400">
                  {applyError}
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-border dark:border-border-dark">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={cover === "loading"}
                    onClick={() => void draftCoverLetter()}
                  >
                    {cover === "open" ? "Regenerate draft" : "Draft a cover letter"}
                  </Button>
                  <span className="text-xs text-subtle dark:text-subtle-dark">
                    Built from your resume and this posting&apos;s requirements — edit before sending.
                  </span>
                </div>

                {coverError && (
                  <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {coverError}
                    {coverError.toLowerCase().includes("resume") && (
                      <a href="/resume" className="ml-1 underline text-forest dark:text-forest-muted">
                        Upload a resume
                      </a>
                    )}
                  </p>
                )}

                {cover === "open" && (
                  <div className="mt-3">
                    <textarea
                      readOnly
                      value={coverText}
                      rows={10}
                      aria-label="Cover letter draft"
                      className="w-full rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-3 text-sm font-mono leading-relaxed text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-forest/30"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => void copyCoverLetter()}>
                        {coverCopied ? "Copied" : "Copy"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setCover("closed")}>
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Keep browsing */}
            <div className="border-t border-border dark:border-border-dark pt-6 flex items-center justify-between gap-4 pb-4">
              <button
                onClick={() => void goTo(-1)}
                disabled={!deck || index <= 0}
                className="group text-left disabled:opacity-40 disabled:cursor-not-allowed rounded"
              >
                <span className="block text-xs font-mono uppercase tracking-wider text-subtle dark:text-subtle-dark mb-1">
                  ← Previous
                </span>
                <span className="text-sm font-medium text-ink dark:text-ink-dark group-hover:text-forest dark:group-hover:text-forest-muted transition-colors">
                  Earlier job
                </span>
              </button>
              <p className="hidden sm:block text-xs text-subtle dark:text-subtle-dark text-center">
                Swipe, or use ← → keys
              </p>
              <button
                onClick={() => void goTo(1)}
                disabled={!deck || (index >= deck.ids.length - 1 && index >= deck.total - 1)}
                className="group text-right disabled:opacity-40 disabled:cursor-not-allowed rounded"
              >
                <span className="block text-xs font-mono uppercase tracking-wider text-subtle dark:text-subtle-dark mb-1">
                  Next →
                </span>
                <span className="text-sm font-medium text-ink dark:text-ink-dark group-hover:text-forest dark:group-hover:text-forest-muted transition-colors">
                  Next job
                </span>
              </button>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
