"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DOMPurify from "dompurify";
import { api, Job, formatDate } from "@/lib/api";
import dynamic from "next/dynamic";

const FaultyTerminal = dynamic(() => import("@/components/FaultyTerminal"), {
  ssr: false,
});

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
          <div className="animate-pulse space-y-6">
            <div className="h-5 bg-paper-warm dark:bg-[#1C1917] rounded w-20" />
            <div className="h-10 bg-paper-warm dark:bg-[#1C1917] rounded w-96" />
            <div className="h-96 bg-paper-warm dark:bg-[#1C1917] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

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

      <div className="relative z-10 max-w-3xl">
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
              name: "DotMatch",
              value: job.id,
            },
          }),
        }}
      />

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-[#78716C] dark:text-[#A8A29E] hover:text-ink dark:hover:text-[#F5F5F4] mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        Back to jobs
      </button>

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink dark:text-[#F5F5F4] mb-2">
          {job.title}
        </h1>
        <p className="text-[#78716C] dark:text-[#A8A29E]">
          <span className="text-forest dark:text-[#40916C] font-medium">
            {job.company?.name || "Unknown Company"}
          </span>
          {job.location && <span className="text-[#A8A29E]"> · {job.location}</span>}
          {job.remote && <span className="text-forest/70 dark:text-[#40916C]/70"> · Remote</span>}
        </p>
      </header>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-8">
        {job.salary_min && job.salary_max && (
          <Badge variant="ember">
            ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}
          </Badge>
        )}
        {job.experience_level && <Badge>{job.experience_level}</Badge>}
        {job.employment_type && <Badge>{job.employment_type}</Badge>}
        {job.source_type && <Badge>via {job.source_type}</Badge>}
        {formatDate(job.posted_at) && <Badge>Posted {formatDate(job.posted_at)}</Badge>}
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-mono text-[#A8A29E] uppercase tracking-wider mb-3">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] text-[#78716C] dark:text-[#A8A29E]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {job.description && (
        <div className="mb-10">
          <h3 className="text-xs font-mono text-[#A8A29E] uppercase tracking-wider mb-4">
            Description
          </h3>
          <div className="rounded-xl bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] p-6 lg:p-8">
            <div
              className="text-sm job-description"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
            />
          </div>
        </div>
      )}

      {/* Apply */}
      {job.url && (
        <div className="sticky bottom-0 left-0 right-0 py-4 bg-gradient-to-t from-paper via-paper to-transparent dark:from-[#0C0A09] dark:via-[#0C0A09] dark:to-transparent">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-ember text-paper rounded-lg hover:bg-ember-light font-medium transition-colors"
          >
            Apply for this position
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
      </div>
    </div>
  );
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "ember";
}) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono ${
        variant === "ember"
          ? "bg-ember/10 text-ember dark:bg-[#FB923C]/10 dark:text-[#FB923C]"
          : "bg-paper-warm dark:bg-[#1C1917] border border-paper-deep dark:border-[#292524] text-[#78716C] dark:text-[#A8A29E]"
      }`}
    >
      {children}
    </span>
  );
}
