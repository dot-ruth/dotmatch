"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Job, formatDate } from "@/lib/api";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import JobCard from "@/components/JobCard";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [worldwideOnly, setWorldwideOnly] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [discovering, setDiscovering] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [discoverMsg, setDiscoverMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    loadJobs();
  }, [page, worldwideOnly]);

  async function loadJobs() {
    setLoading(true);
    setLoadError(null);
    try {
      const params: Record<string, unknown> = { offset: page * limit, limit };
      if (worldwideOnly) params.worldwide_only = true;
      if (searchQuery) params.search_query = searchQuery;
      const res = await api.getJobs(params);
      setJobs(res.items || []);
      setTotal(res.total || 0);
      setLastUpdated(new Date().toLocaleString());
    } catch {
      setLoadError("We couldn't load jobs right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDiscover() {
    setDiscovering(true);
    setDiscoverMsg(null);
    setLoadError(null);
    try {
      const result = await api.discoverJobs();
      setDiscoverMsg(`Found ${result.new_jobs} new jobs from ${result.sources_checked} sources.`);
      await loadJobs();
    } catch {
      setLoadError("We couldn't refresh jobs right now. Your existing results are still available.");
    } finally {
      setDiscovering(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    loadJobs();
  }

  return (
    <div className="relative p-6 lg:p-10 min-h-screen animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink dark:text-ink-dark mb-1">
            Jobs
          </h1>
          <p className="text-sm text-muted dark:text-muted-dark">
            <span className="font-mono text-forest dark:text-forest-muted">{total}</span> software engineering roles worldwide
            {lastUpdated && <span className="block mt-1 text-xs text-subtle dark:text-subtle-dark">Last updated {lastUpdated}</span>}
          </p>
        </div>
        <Button onClick={handleDiscover} disabled={discovering} loading={discovering}>
          Discover Jobs
        </Button>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle dark:text-subtle-dark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <label htmlFor="job-search" className="sr-only">Search jobs</label>
            <input
              id="job-search"
              type="text"
              placeholder="Search by title, skill, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-describedby="job-search-help job-results-status"
              className="w-full pl-10 pr-4 py-3 bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark text-ink dark:text-ink-dark placeholder-subtle dark:placeholder-subtle-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-forest/30 dark:focus:ring-forest-muted/30 focus:border-forest/50 dark:focus:border-forest-muted/50 transition-all duration-200 text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-3 bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark rounded-xl cursor-pointer hover:bg-surface-deep dark:hover:bg-surface-dark-deep transition-all duration-200" title="Show jobs that do not require residence in a specific country.">
              <input
                type="checkbox"
                checked={worldwideOnly}
                onChange={(e) => { setWorldwideOnly(e.target.checked); setPage(0); }}
                className="w-4 h-4 rounded border-border dark:border-border-dark text-forest dark:text-forest-muted accent-forest dark:accent-forest-muted"
              />
              <span className="text-sm text-muted dark:text-muted-dark whitespace-nowrap">Open worldwide / eligible to work from Ethiopia</span>
            </label>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </div>
        </div>
      </form>
      <p id="job-search-help" className="-mt-5 mb-6 text-xs text-subtle dark:text-subtle-dark">
        Shows roles open to applicants working from Ethiopia or another eligible location.
      </p>
      <p id="job-results-status" className="sr-only" aria-live="polite">
        {loading ? "Loading jobs" : loadError ? "Jobs could not be loaded" : `${total} jobs found`}
      </p>

      {discoverMsg && (
        <div className="mb-6 p-4 rounded-xl bg-forest/10 text-forest dark:bg-forest-muted/10 dark:text-forest-muted text-sm font-medium" role="status">
          {discoverMsg}
        </div>
      )}

      {loadError && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert">
          <p className="text-sm">{loadError}</p>
          <Button size="sm" variant="secondary" onClick={loadJobs}>Retry</Button>
        </div>
      )}

      {/* Active filters indicator */}
      {(searchQuery || worldwideOnly) && (
        <div className="flex items-center gap-2 mb-6 animate-fade-in">
          <span className="text-xs text-subtle dark:text-subtle-dark">Filters:</span>
          {worldwideOnly && (
            <Badge variant="forest">Open worldwide</Badge>
          )}
          {searchQuery && (
            <Badge variant="forest">&quot;{searchQuery}&quot;</Badge>
          )}
          <button
            onClick={() => { setSearchQuery(""); setWorldwideOnly(false); setPage(0); }}
            className="text-xs text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark underline transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-surface-warm dark:bg-surface-dark-warm rounded-xl shimmer" />
          ))}
        </div>
      ) : loadError ? (
        <div className="py-20 text-center text-sm text-muted dark:text-muted-dark">
          Jobs will appear here once the connection is restored.
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-xl bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-subtle dark:text-subtle-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-display text-lg font-semibold text-ink dark:text-ink-dark mb-2">
            No jobs found
          </p>
          <p className="text-sm text-muted dark:text-muted-dark">
            Click &quot;Discover Jobs&quot; to fetch the latest opportunities
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm font-mono text-subtle dark:text-subtle-dark">
              {page + 1} / {Math.ceil(total / limit) || 1}
            </span>
            <Button
              variant="secondary"
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
