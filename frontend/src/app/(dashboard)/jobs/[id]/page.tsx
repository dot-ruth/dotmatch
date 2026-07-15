"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DOMPurify from "dompurify";
import { api, Job } from "@/lib/api";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, [id]);

  async function loadJob() {
    try {
      const res = await api.getJob(id);
      setJob(res);
    } catch {
      router.push("/jobs");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8"><div className="animate-pulse h-64 bg-white/15 rounded" /></div>;
  }

  if (!job) return null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="text-blue-300 hover:underline mb-4 text-sm font-medium">
        ← Back to jobs
      </button>

      <div className="bg-white/15 backdrop-blur-sm rounded-lg shadow p-6 border border-white/20">
        <h1 className="text-2xl font-bold text-white mb-2">{job.title}</h1>
        <p className="text-white mb-4">
          {job.company?.name || "Unknown Company"}
          {job.location && ` · ${job.location}`}
          {job.remote && " · Remote"}
        </p>

        <div className="flex flex-wrap gap-4 mb-6 text-sm text-white">
          {job.salary_min && job.salary_max && (
            <span className="text-green-300 font-medium">${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
          )}
          {job.experience_level && <span>{job.experience_level}</span>}
          {job.employment_type && <span>{job.employment_type}</span>}
          {job.source_type && <span>via {job.source_type}</span>}
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {job.skills.map((skill) => (
              <span key={skill} className="text-sm bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        )}

        {job.description && (
          <div className="prose prose-invert max-w-none mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
            <div
              className="text-sm text-white job-description"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
            />
          </div>
        )}

        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Apply on Company Site →
          </a>
        )}
      </div>
    </div>
  );
}
