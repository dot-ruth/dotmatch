"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Job, formatDate } from "@/lib/api";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";

const SOURCES = [
  "RemoteOK", "WeWorkRemotely", "Remotive", "Arbeitnow",
  "Jobicy", "Findwork", "DevJobsScanner", "Himalayas",
  "FreeHire", "RemoteJobsOrg", "JobsBase",
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
          <div className="h-8 bg-surface-warm dark:bg-surface-dark-warm rounded-lg w-48 shimmer" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface-warm dark:bg-surface-dark-warm rounded-xl shimmer" />
            ))}
          </div>
          <div className="h-64 bg-surface-warm dark:bg-surface-dark-warm rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-6 lg:p-10 min-h-screen animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink dark:text-ink-dark mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-muted dark:text-muted-dark">
            Remote software engineering jobs from company career pages
          </p>
        </div>
        <Button onClick={handleDiscover} disabled={discovering} loading={discovering}>
          Discover Fresh Jobs
        </Button>
      </div>

      {/* Message */}
      {discoverMsg && (
        <div className="mb-8 p-4 rounded-xl bg-forest/10 text-forest dark:bg-forest-muted/10 dark:text-forest-muted text-sm font-medium animate-fade-in">
          {discoverMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Card className="p-5">
          <p className="text-sm text-muted dark:text-muted-dark mb-1">Total Jobs</p>
          <p className="font-display text-3xl font-bold text-ink dark:text-ink-dark">{totalJobs}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted dark:text-muted-dark mb-1">Sources</p>
          <p className="font-display text-3xl font-bold text-forest dark:text-forest-muted">{SOURCES.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted dark:text-muted-dark mb-1">Last Refreshed</p>
          <p className="font-display text-lg font-bold text-ink dark:text-ink-dark">
            {lastRefresh || "Never"}
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Button variant="secondary" onClick={() => router.push("/jobs")}>
          Browse All Jobs
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
        <Button variant="secondary" onClick={() => router.push("/resume")}>
          Upload Resume
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </Button>
        <Button variant="ghost" onClick={() => router.push("/jobs?worldwide_only=true")}>
          <svg className="w-3.5 h-3.5 text-forest dark:text-forest-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
          </svg>
          Remote from Ethiopia
        </Button>
      </div>

      {/* Sources Grid */}
      <Card className="overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-border dark:border-border-dark">
          <h2 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
            Job Sources
          </h2>
          <p className="text-xs text-subtle dark:text-subtle-dark mt-1">
            Directly from company career pages &amp; remote-first boards
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border dark:bg-border-dark">
          {SOURCES.map((source) => (
            <div
              key={source}
              className="px-4 py-3 bg-surface-warm dark:bg-surface-dark-warm flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-forest-muted shrink-0" />
              <span className="text-sm font-mono text-muted dark:text-muted-dark truncate">
                {source}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Jobs */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-border-dark">
          <h2 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
            Recent Jobs
          </h2>
          <button
            onClick={() => router.push("/jobs")}
            className="text-sm text-forest dark:text-forest-muted hover:underline font-medium transition-colors"
          >
            View all
          </button>
        </div>
        {recentJobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-surface-deep dark:bg-surface-dark-deep flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-subtle dark:text-subtle-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-display text-base font-semibold text-ink dark:text-ink-dark mb-1">
              No jobs yet
            </p>
            <p className="text-sm text-muted dark:text-muted-dark">
              Click &quot;Discover Fresh Jobs&quot; to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border dark:divide-border-dark">
            {recentJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-deep/50 dark:hover:bg-surface-dark-deep/50 transition-all duration-200 text-left group"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-ink dark:text-ink-dark truncate group-hover:text-forest dark:group-hover:text-forest-muted transition-colors">
                    {job.title}
                  </p>
                  <p className="text-xs text-muted dark:text-muted-dark truncate mt-0.5">
                    {job.company?.name || "Unknown"}
                    {job.location && ` · ${job.location}`}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  {job.salary_min && job.salary_max && (
                    <span className="text-xs font-mono text-ember dark:text-ember-muted">
                      ${(job.salary_min / 1000).toFixed(0)}k–${(job.salary_max / 1000).toFixed(0)}k
                    </span>
                  )}
                  <Badge variant="muted">{job.source_type}</Badge>
                  {formatDate(job.posted_at) && (
                    <span className="text-[10px] font-mono text-subtle dark:text-subtle-dark">
                      {formatDate(job.posted_at)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
