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
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-48" />
          <div className="h-24 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome to DotMatch</h1>
          <p className="text-white mt-1">All remote jobs in one place</p>
        </div>
        <button
          onClick={handleDiscover}
          disabled={discovering}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {discovering ? "Discovering..." : "Discover Jobs"}
        </button>
      </div>

      {discoverMsg && (
        <div className="mb-6 p-3 bg-green-500/30 text-green-200 rounded-lg text-sm font-medium">{discoverMsg}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/15 backdrop-blur-sm rounded-lg shadow p-5 border border-white/20">
          <p className="text-sm text-gray-200">Total Jobs</p>
          <p className="text-3xl font-bold text-blue-300">{totalJobs}</p>
        </div>
        <div className="bg-white/15 backdrop-blur-sm rounded-lg shadow p-5 border border-white/20">
          <p className="text-sm text-gray-200">Sources</p>
          <p className="text-3xl font-bold text-green-300">5</p>
        </div>
        <div
          className="bg-white/15 backdrop-blur-sm rounded-lg shadow p-5 cursor-pointer hover:bg-white/20 transition-colors border border-white/20"
          onClick={() => router.push("/jobs")}
        >
          <p className="text-sm text-gray-200">Browse All</p>
          <p className="text-3xl font-bold text-purple-300">View →</p>
        </div>
      </div>

      <div className="bg-white/15 backdrop-blur-sm rounded-lg shadow p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Jobs</h2>
          <button
            onClick={() => router.push("/jobs")}
            className="text-sm text-blue-300 hover:underline font-medium"
          >
            View all →
          </button>
        </div>
        {recentJobs.length === 0 ? (
          <p className="text-white text-sm py-4">No jobs yet. Click &quot;Discover Jobs&quot; to get started.</p>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-white/10 rounded hover:bg-white/15 cursor-pointer transition-colors"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <div>
                  <p className="font-medium text-white">{job.title}</p>
                  <p className="text-sm text-white">
                    {job.company?.name || "Unknown"} · {job.location || "Remote"}
                  </p>
                </div>
                <div className="text-right">
                  {job.salary_min && job.salary_max && (
                    <p className="text-sm text-green-300 font-medium">
                      ${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k
                    </p>
                  )}
                  <p className="text-xs text-white">{job.source_type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
