"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Job } from "@/lib/api";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [discovering, setDiscovering] = useState(false);
  const limit = 20;

  useEffect(() => {
    loadJobs();
  }, [page, remoteOnly]);

  async function loadJobs() {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { offset: page * limit, limit };
      if (remoteOnly) params.remote_only = true;
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Jobs</h1>
          <p className="text-sm text-white mt-1">{total} remote opportunities</p>
        </div>
        <button
          onClick={handleDiscover}
          disabled={discovering}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {discovering ? "Discovering..." : "Discover Jobs"}
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title, skill, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/15 border border-white/30 text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="flex items-center gap-2 text-sm text-white font-medium">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="rounded"
          />
          Remote only
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-white/15 rounded animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-white mb-2">No jobs found</p>
          <p className="text-sm text-gray-300">Click &quot;Discover Jobs&quot; to fetch the latest opportunities</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 cursor-pointer transition-colors"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white">{job.title}</h3>
                    <p className="text-white text-sm">
                      {job.company?.name || "Unknown Company"}
                      {job.location && ` · ${job.location}`}
                      {job.remote && " · Remote"}
                    </p>
                    {job.salary_min && job.salary_max && (
                      <p className="text-green-300 text-sm mt-1 font-medium">
                        ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                      </p>
                    )}
                    {job.description && (
                      <p className="text-white text-xs mt-1 line-clamp-2">
                        {job.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120)}...
                      </p>
                    )}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skills.slice(0, 5).map((skill) => (
                          <span key={skill} className="text-xs bg-blue-500/30 text-white px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-xs text-white">+{job.skills.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-xs text-white bg-white/20 px-2 py-1 rounded">
                      {job.source_type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border border-white/30 text-white rounded-lg disabled:opacity-50 hover:bg-white/15"
            >
              Previous
            </button>
            <span className="text-sm text-white font-medium">
              Page {page + 1} of {Math.ceil(total / limit) || 1}
            </span>
            <button
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-white/30 text-white rounded-lg disabled:opacity-50 hover:bg-white/15"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
