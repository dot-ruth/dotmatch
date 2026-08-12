"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Job } from "@/lib/api";
import dynamic from "next/dynamic";

const FaultyTerminal = dynamic(() => import("@/components/FaultyTerminal"), {
  ssr: false,
});

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
      {/* FaultyTerminal background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.12 }}>
        <FaultyTerminal
          scale={2.5}
          gridMul={[2, 1]}
          digitSize={2.5}
          timeScale={0.3}
          pause={false}
          scanlineIntensity={0.4}
          glitchAmount={0.8}
          flickerAmount={0.6}
          noiseAmp={0.2}
          chromaticAberration={0}
          dither={0}
          curvature={0}
          tint="#1B4332"
          mouseReact={false}
          mouseStrength={0}
          pageLoadAnimation={true}
          brightness={0.5}
        />
      </div>

      <div className="relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink dark:text-[#F5F5F4] mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-[#78716C] dark:text-[#A8A29E]">All remote jobs in one place</p>
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
          <p className="font-display text-3xl font-bold text-forest dark:text-[#40916C]">14</p>
        </div>
        <button
          onClick={() => router.push("/jobs")}
          className="p-5 rounded-xl bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] text-left hover:border-forest/30 dark:hover:border-[#40916C]/30 transition-colors"
        >
          <p className="text-sm text-[#78716C] dark:text-[#A8A29E] mb-1">Browse All</p>
          <p className="font-display text-3xl font-bold text-ember dark:text-[#FB923C]">
            View &rarr;
          </p>
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
            <p className="text-[#78716C] dark:text-[#A8A29E] text-sm mb-1">No jobs yet</p>
            <p className="text-[#A8A29E] dark:text-[#78716C] text-xs">
              Click &quot;Discover Jobs&quot; to get started
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
