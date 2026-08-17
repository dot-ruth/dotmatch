"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Job, formatDate } from "@/lib/api";

const SOURCES = [
  "RemoteOK", "WeWorkRemotely", "Remotive", "Arbeitnow",
  "Jobicy", "Findwork", "DevJobsScanner", "Himalayas",
  "FreeHire", "RemoteJobsOrg", "JobsBase", "Greenhouse",
];

export default function DashboardPage() {
  const router = useRouter();
  const [totalJobs, setTotalJobs] = useState(0);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [discoverMsg, setDiscoverMsg] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api.getJobs({ limit: 10 });
      setTotalJobs(res.total || 0);
      setRecentJobs(res.items || []);
      if (res.total > 0) {
        setLastRefresh(new Date().toLocaleTimeString());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleDiscover() {
    setDiscovering(true);
    setDiscoverMsg(null);
    try {
      const result = await api.discoverJobs();
      setDiscoverMsg(`Found ${result.new_jobs} new jobs from ${result.sources_checked} sources`);
      setLastRefresh(new Date().toLocaleTimeString());
      loadData();
    } catch {
      setDiscoverMsg("Discovery failed");
    } finally {
      setDiscovering(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-paper-warm dark:bg-[#1C1917] rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-paper-warm dark:bg-[#1C1917] rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-paper-warm dark:bg-[#1C1917] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-6 lg:p-10 min-h-screen">
      <div className="relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink dark:text-[#F5F5F4] mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-[#78716C] dark:text-[#A8A29E]">
            Remote software engineering jobs from company career pages
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
            "Discover Fresh Jobs"
          )}
        </button>
      </div>

      {/* Message */}
      {discoverMsg && (
        <div className="mb-8 p-4 rounded-lg bg-forest/10 text-forest dark:bg-[#40916C]/10 dark:text-[#40916C] text-sm font-medium">
          {discoverMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="p-5 rounded-xl bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524]">
          <p className="text-sm text-[#78716C] dark:text-[#A8A29E] mb-1">Total Jobs</p>
          <p className="font-display text-3xl font-bold text-ink dark:text-[#F5F5F4]">{totalJobs}</p>
        </div>
        <div className="p-5 rounded-xl bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524]">
          <p className="text-sm text-[#78716C] dark:text-[#A8A29E] mb-1">Sources</p>
          <p className="font-display text-3xl font-bold text-forest dark:text-[#40916C]">{SOURCES.length}</p>
        </div>
        <div className="p-5 rounded-xl bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524]">
          <p className="text-sm text-[#78716C] dark:text-[#A8A29E] mb-1">Last Refreshed</p>
          <p className="font-display text-lg font-bold text-ink dark:text-[#F5F5F4]">
            {lastRefresh || "Never"}
          </p>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="rounded-xl bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-paper-deep dark:border-[#292524]">
          <h2 className="font-display text-lg font-semibold text-ink dark:text-[#F5F5F4]">
            Job Sources
          </h2>
          <p className="text-xs text-[#A8A29E] dark:text-[#78716C] mt-1">
            Directly from company career pages &amp; remote-first boards
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-paper-deep dark:bg-[#292524]">
          {SOURCES.map((source) => (
            <div
              key={source}
              className="px-4 py-3 bg-paper-warm dark:bg-[#1C1917] text-sm font-mono text-[#78716C] dark:text-[#A8A29E]"
            >
              {source}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button
          onClick={() => router.push("/jobs")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-paper-deep dark:border-[#292524] bg-paper-warm dark:bg-[#1C1917] text-sm font-medium text-ink dark:text-[#F5F5F4] hover:border-forest/30 dark:hover:border-[#40916C]/30 transition-colors"
        >
          Browse All Jobs
          <svg className="w-3.5 h-3.5 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => router.push("/jobs?worldwide_only=true")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-forest/20 dark:border-[#40916C]/20 bg-forest/5 dark:bg-[#40916C]/5 text-sm font-medium text-forest dark:text-[#40916C] hover:bg-forest/10 dark:hover:bg-[#40916C]/10 transition-colors"
        >
          Remote from Ethiopia
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
          </svg>
        </button>
      </div>

      {/* Recent Jobs */}
      <div className="rounded-xl bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-paper-deep dark:border-[#292524]">
          <h2 className="font-display text-lg font-semibold text-ink dark:text-[#F5F5F4]">
            Recent Jobs
          </h2>
          <button
            onClick={() => router.push("/jobs")}
            className="text-sm text-forest dark:text-[#40916C] hover:underline font-medium"
          >
            View all
          </button>
        </div>
        {recentJobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-paper-deep dark:bg-[#292524] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-display text-base font-semibold text-ink dark:text-[#F5F5F4] mb-1">
              No jobs yet
            </p>
            <p className="text-sm text-[#78716C] dark:text-[#A8A29E]">
              Click &quot;Discover Fresh Jobs&quot; to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-paper-deep dark:divide-[#292524]">
            {recentJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-paper dark:hover:bg-[#0C0A09] transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-ink dark:text-[#F5F5F4] truncate">
                    {job.title}
                  </p>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E] truncate mt-0.5">
                    {job.company?.name || "Unknown"}
                    {job.location && ` · ${job.location}`}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  {job.salary_min && job.salary_max && (
                    <span className="text-xs font-mono text-ember dark:text-[#FB923C]">
                      ${(job.salary_min / 1000).toFixed(0)}k–${(job.salary_max / 1000).toFixed(0)}k
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-[#A8A29E] bg-paper-deep dark:bg-[#292524] px-2 py-1 rounded">
                    {job.source_type}
                  </span>
                  {formatDate(job.posted_at) && (
                    <span className="text-[10px] font-mono text-[#A8A29E]">
                      {formatDate(job.posted_at)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
