"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Job } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [totalJobs, setTotalJobs] = useState(0);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [discoverMsg, setDiscoverMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api.getJobs({ limit: 10 });
      setTotalJobs(res.total || 0);
      setRecentJobs(res.items || []);
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
      loadData();
    } catch {
      setDiscoverMsg("Discovery failed");
    } finally {
      setDiscovering(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-48" />
          <div className="h-24 bg-gray-200 dark:bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Welcome to DotMatch</h1>
          <p className="text-gray-600 dark:text-white mt-1">All remote jobs in one place</p>
        </div>
        <button
          onClick={handleDiscover}
          disabled={discovering}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium whitespace-nowrap"
        >
          {discovering ? "Discovering..." : "Discover Jobs"}
        </button>
      </div>

      {discoverMsg && (
        <div className="mb-6 p-3 bg-green-100 dark:bg-green-500/30 text-green-700 dark:text-green-200 rounded-lg text-sm font-medium">{discoverMsg}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-100 dark:bg-white/15 backdrop-blur-sm rounded-lg shadow p-5 border border-gray-200 dark:border-white/20">
          <p className="text-sm text-gray-500 dark:text-gray-200">Total Jobs</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{totalJobs}</p>
        </div>
        <div className="bg-gray-100 dark:bg-white/15 backdrop-blur-sm rounded-lg shadow p-5 border border-gray-200 dark:border-white/20">
          <p className="text-sm text-gray-500 dark:text-gray-200">Sources</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-300">9</p>
        </div>
        <div
          className="bg-gray-100 dark:bg-white/15 backdrop-blur-sm rounded-lg shadow p-5 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-white/20"
          onClick={() => router.push("/jobs")}
        >
          <p className="text-sm text-gray-500 dark:text-gray-200">Browse All</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">View →</p>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-white/15 backdrop-blur-sm rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Jobs</h2>
          <button
            onClick={() => router.push("/jobs")}
            className="text-sm text-blue-600 dark:text-blue-300 hover:underline font-medium"
          >
            View all →
          </button>
        </div>
        {recentJobs.length === 0 ? (
          <p className="text-gray-600 dark:text-white text-sm py-4">No jobs yet. Click &quot;Discover Jobs&quot; to get started.</p>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-white/10 rounded hover:bg-gray-100 dark:hover:bg-white/15 cursor-pointer transition-colors"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                  <p className="text-sm text-gray-600 dark:text-white truncate">
                    {job.company?.name || "Unknown"} · {job.location || "Remote"}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end shrink-0">
                  {job.salary_min && job.salary_max && (
                    <p className="text-sm text-green-600 dark:text-green-300 font-medium">
                      ${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-white">{job.source_type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
