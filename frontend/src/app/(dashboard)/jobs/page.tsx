"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Job, formatDate } from "@/lib/api";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [worldwideOnly, setWorldwideOnly] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [discovering, setDiscovering] = useState(false);
  const limit = 20;

  useEffect(() => {
    loadJobs();
  }, [page, worldwideOnly]);

  async function loadJobs() {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { offset: page * limit, limit };
      if (worldwideOnly) params.worldwide_only = true;
      if (searchQuery) params.search_query = searchQuery;
      const res = await api.getJobs(params);
      setJobs(res.items || []);
      setTotal(res.total || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleDiscover() {
    setDiscovering(true);
    try {
      await api.discoverJobs();
      loadJobs();
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
    <div className="relative p-6 lg:p-10 min-h-screen">
      <div className="relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink dark:text-[#F5F5F4] mb-1">
            Jobs
          </h1>
          <p className="text-sm text-[#78716C] dark:text-[#A8A29E]">
            <span className="font-mono text-forest dark:text-[#40916C]">{total}</span> software engineering roles worldwide
          </p>
        </div>
        <button
          onClick={handleDiscover}
          disabled={discovering}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-paper rounded-lg hover:bg-forest-light disabled:opacity-50 font-medium text-sm transition-colors"
        >
          {discovering ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Discovering...
            </>
          ) : (
            "Discover Jobs"
          )}
        </button>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, skill, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] text-ink dark:text-[#E7E5E4] placeholder-[#A8A29E] rounded-lg focus:outline-none focus:border-forest/50 dark:focus:border-[#40916C]/50 transition-colors text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-3 bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] rounded-lg cursor-pointer hover:bg-paper-deep dark:hover:bg-[#292524] transition-colors">
              <input
                type="checkbox"
                checked={worldwideOnly}
                onChange={(e) => { setWorldwideOnly(e.target.checked); setPage(0); }}
                className="w-4 h-4 rounded border-[#D6D3D1] dark:border-[#44403C] text-forest dark:text-[#40916C]"
              />
              <span className="text-sm text-[#78716C] dark:text-[#A8A29E] whitespace-nowrap">Remote from Ethiopia</span>
            </label>
            <button
              type="submit"
              className="px-5 py-3 bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] text-ink dark:text-[#D6D3D1] rounded-lg hover:bg-paper-deep dark:hover:bg-[#292524] text-sm font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-paper-warm dark:bg-[#1C1917] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-xl bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-display text-lg font-semibold text-ink dark:text-[#F5F5F4] mb-2">
            No jobs found
          </p>
          <p className="text-sm text-[#78716C] dark:text-[#A8A29E]">
            Click &quot;Discover Jobs&quot; to fetch the latest opportunities
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="w-full text-left p-5 rounded-xl bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] hover:border-forest/30 dark:hover:border-[#40916C]/30 hover:shadow-card dark:hover:shadow-none transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-semibold text-ink dark:text-[#F5F5F4] mb-1 truncate">
                      {job.title}
                    </p>
                    <p className="text-sm text-[#78716C] dark:text-[#A8A29E] mb-2">
                      <span className="text-forest dark:text-[#40916C] font-medium">
                        {job.company?.name || "Unknown"}
                      </span>
                      {job.location && <span className="text-[#A8A29E]"> · {job.location}</span>}
                      {job.remote && <span className="text-forest/70 dark:text-[#40916C]/70"> · Remote</span>}
                    </p>
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-paper-deep dark:bg-[#292524] text-[#78716C] dark:text-[#A8A29E]"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="text-xs font-mono text-[#A8A29E]">
                            +{job.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {job.salary_min && job.salary_max && (
                      <p className="text-sm font-mono text-ember dark:text-[#FB923C] mb-1">
                        ${(job.salary_min / 1000).toFixed(0)}k–${(job.salary_max / 1000).toFixed(0)}k
                      </p>
                    )}
                    <span className="text-[10px] font-mono text-[#A8A29E] bg-paper-deep dark:bg-[#292524] px-2 py-1 rounded">
                      {job.source_type}
                    </span>
                    {formatDate(job.posted_at) && (
                      <p className="text-[10px] font-mono text-[#A8A29E] mt-1">
                        {formatDate(job.posted_at)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border border-paper-deep dark:border-[#292524] text-[#78716C] dark:text-[#A8A29E] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper-warm dark:hover:bg-[#1C1917] text-sm font-medium transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-mono text-[#A8A29E]">
              {page + 1} / {Math.ceil(total / limit) || 1}
            </span>
            <button
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-paper-deep dark:border-[#292524] text-[#78716C] dark:text-[#A8A29E] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper-warm dark:hover:bg-[#1C1917] text-sm font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
