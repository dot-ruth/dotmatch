"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ResumeProfile, MatchedJob } from "@/lib/api";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import FileUpload from "@/components/FileUpload";
import MatchScore from "@/components/MatchScore";

export default function ResumePage() {
  const router = useRouter();
  const [resume, setResume] = useState<ResumeProfile | null>(null);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResume();
  }, []);

  async function loadResume() {
    try {
      const profile = await api.getResumeProfile();
      setResume(profile);
      if (profile) {
        const matched = await api.getMatchedJobs({ limit: 10 });
        setMatchedJobs(matched);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const profile = await api.uploadResume(file);
      setResume(profile);
      const matched = await api.getMatchedJobs({ limit: 10 });
      setMatchedJobs(matched);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-warm dark:bg-surface-dark-warm rounded-lg w-48 shimmer" />
          <div className="h-48 bg-surface-warm dark:bg-surface-dark-warm rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 min-h-screen animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink dark:text-ink-dark mb-1">
          My Resume
        </h1>
        <p className="text-sm text-muted dark:text-muted-dark">
          Upload your resume to get personalized job matches
        </p>
      </div>

      {/* Upload Section */}
      {!resume ? (
        <Card className="p-8">
          <div className="max-w-xl mx-auto">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-ink-dark mb-4">
              Upload your resume
            </h2>
            <p className="text-sm text-muted dark:text-muted-dark mb-6">
              We&apos;ll extract your skills and experience to find the best matching remote software engineering jobs.
            </p>
            <FileUpload onUpload={handleUpload} />
            {error && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Resume Profile */}
          <Card className="p-6 mb-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink dark:text-ink-dark mb-1">
                  {resume.filename}
                </h2>
                <p className="text-xs text-subtle dark:text-subtle-dark">
                  Uploaded {new Date(resume.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => { setResume(null); setMatchedJobs([]); }}>
                Replace
              </Button>
            </div>

            {/* Extracted Data */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Skills */}
              <div>
                <h3 className="text-xs font-mono text-subtle dark:text-subtle-dark uppercase tracking-wider mb-3">
                  Detected Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resume.skills.length > 0 ? (
                    resume.skills.map((skill) => (
                      <Badge key={skill} variant="forest">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted dark:text-muted-dark">No skills detected</p>
                  )}
                </div>
              </div>

              {/* Job Titles */}
              <div>
                <h3 className="text-xs font-mono text-subtle dark:text-subtle-dark uppercase tracking-wider mb-3">
                  Detected Roles
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resume.job_titles.length > 0 ? (
                    resume.job_titles.map((title) => (
                      <Badge key={title}>{title}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted dark:text-muted-dark">No roles detected</p>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h3 className="text-xs font-mono text-subtle dark:text-subtle-dark uppercase tracking-wider mb-3">
                  Experience
                </h3>
                {resume.experience_years ? (
                  <p className="text-sm text-ink dark:text-ink-dark font-medium">
                    {resume.experience_years} years
                  </p>
                ) : (
                  <p className="text-sm text-muted dark:text-muted-dark">Not detected</p>
                )}
              </div>

              {/* Education */}
              <div>
                <h3 className="text-xs font-mono text-subtle dark:text-subtle-dark uppercase tracking-wider mb-3">
                  Education
                </h3>
                {resume.education.length > 0 ? (
                  <div className="space-y-1">
                    {resume.education.map((edu) => (
                      <p key={edu} className="text-sm text-ink dark:text-ink-dark">{edu}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted dark:text-muted-dark">Not detected</p>
                )}
              </div>
            </div>
          </Card>

          {/* Matched Jobs */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
              Best Matching Jobs
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/jobs")}>
              View all jobs
            </Button>
          </div>

          {matchedJobs.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted dark:text-muted-dark">
                No matching jobs found. Try discovering more jobs first.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {matchedJobs.map((matched) => (
                <button
                  key={matched.job.id}
                  onClick={() => router.push(`/jobs/${matched.job.id}`)}
                  className="w-full text-left p-5 rounded-xl bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark hover:border-forest/30 dark:hover:border-forest-muted/30 hover:shadow-card dark:hover:shadow-none transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <MatchScore score={matched.match_score} />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base font-semibold text-ink dark:text-ink-dark mb-1 truncate group-hover:text-forest dark:group-hover:text-forest-muted transition-colors">
                        {matched.job.title}
                      </p>
                      <p className="text-sm text-muted dark:text-muted-dark mb-2">
                        <span className="text-forest dark:text-forest-muted font-medium">
                          {matched.job.company?.name || "Unknown"}
                        </span>
                        {matched.job.location && <span className="text-subtle dark:text-subtle-dark"> · {matched.job.location}</span>}
                      </p>
                      {matched.matched_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {matched.matched_skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="forest">{skill}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {matched.job.salary_min && matched.job.salary_max && (
                        <p className="text-sm font-mono text-ember dark:text-ember-muted mb-1">
                          ${(matched.job.salary_min / 1000).toFixed(0)}k–${(matched.job.salary_max / 1000).toFixed(0)}k
                        </p>
                      )}
                      <Badge variant="muted">{matched.job.source_type}</Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
