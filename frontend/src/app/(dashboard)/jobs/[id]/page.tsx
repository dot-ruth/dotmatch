"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DOMPurify from "dompurify";
import { api, Job, formatDate } from "@/lib/api";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadJob();
  }, [id]);

  async function loadJob() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.getJob(id);
      setJob(res);
    } catch {
      setLoadError("We couldn't load this job. It may be temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="relative p-6 lg:p-10 min-h-screen">
        <div className="relative z-10">
          <div className="animate-pulse space-y-6">
            <div className="h-5 bg-surface-warm dark:bg-surface-dark-warm rounded-lg w-20 shimmer" />
            <div className="h-10 bg-surface-warm dark:bg-surface-dark-warm rounded-lg w-96 shimmer" />
            <div className="h-96 bg-surface-warm dark:bg-surface-dark-warm rounded-xl shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 lg:p-10 min-h-screen animate-fade-in">
        <div className="max-w-xl p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert">
          <h1 className="font-display text-xl font-semibold mb-2">Job details unavailable</h1>
          <p className="text-sm mb-5">{loadError}</p>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="secondary" onClick={loadJob}>Retry</Button>
            <Button size="sm" variant="ghost" onClick={() => router.push("/jobs")}>Back to jobs</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="relative p-6 lg:p-10 min-h-screen animate-fade-in">
      <div className="relative z-10">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: job.description?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
            datePosted: job.posted_at || job.created_at,
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

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark mb-8 transition-colors duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        Back to jobs
      </button>

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink dark:text-ink-dark mb-2">
          {job.title}
        </h1>
        <p className="text-muted dark:text-muted-dark">
          <span className="text-forest dark:text-forest-muted font-medium">
            {job.company?.name || "Unknown Company"}
          </span>
          {job.location && <span className="text-subtle dark:text-subtle-dark"> · {job.location}</span>}
          {job.remote && <span className="text-forest/70 dark:text-forest-muted/70"> · Remote</span>}
        </p>
      </header>

      {/* Meta + Apply */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {job.salary_min && job.salary_max && (
          <Badge variant="ember">
            ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}
          </Badge>
        )}
        {job.experience_level && <Badge>{job.experience_level}</Badge>}
        {job.employment_type && <Badge>{job.employment_type}</Badge>}
        {job.source_type && <Badge variant="muted">via {job.source_type}</Badge>}
        {formatDate(job.posted_at) && <Badge variant="muted">Posted {formatDate(job.posted_at)}</Badge>}
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 bg-forest text-white rounded-lg hover:bg-forest/90 text-sm font-medium transition-all duration-200 ml-auto"
          >
            Apply
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mb-8">
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

      {/* Description */}
      {job.description && (
        <div className="mb-10">
          <h3 className="text-xs font-mono text-subtle dark:text-subtle-dark uppercase tracking-wider mb-4">
            Description
          </h3>
          <Card className="p-6 lg:p-8">
            <div
              className="text-sm job-description"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
            />
          </Card>
        </div>
      )}

      </div>
    </div>
  );
}
