"use client";

import { useRouter } from "next/navigation";
import { Job, formatDate } from "@/lib/api";
import Badge from "./Badge";

interface JobCardProps {
  job: Job;
  showMatchScore?: boolean;
  matchScore?: number;
}

export default function JobCard({ job, showMatchScore = false, matchScore }: JobCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="w-full text-left p-5 rounded-xl bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark hover:border-forest/30 dark:hover:border-forest-muted/30 hover:shadow-card dark:hover:shadow-none transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-display text-base font-semibold text-ink dark:text-ink-dark truncate group-hover:text-forest dark:group-hover:text-forest-muted transition-colors">
              {job.title}
            </p>
            {showMatchScore && matchScore !== undefined && (
              <MatchScoreBadge score={matchScore} />
            )}
          </div>
          <p className="text-sm text-muted dark:text-muted-dark mb-2">
            <span className="text-forest dark:text-forest-muted font-medium">
              {job.company?.name || "Unknown"}
            </span>
            {job.location && <span className="text-subtle dark:text-subtle-dark"> · {job.location}</span>}
            {job.remote && <span className="text-forest/70 dark:text-forest-muted/70"> · Remote</span>}
          </p>
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="muted">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 4 && (
                <span className="text-xs font-mono text-subtle dark:text-subtle-dark">
                  +{job.skills.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          {job.salary_min && job.salary_max && (
            <p className="text-sm font-mono text-ember dark:text-ember-muted mb-1">
              ${(job.salary_min / 1000).toFixed(0)}k–${(job.salary_max / 1000).toFixed(0)}k
            </p>
          )}
          <Badge variant="muted">{job.source_type}</Badge>
          {formatDate(job.posted_at) && (
            <p className="text-[10px] font-mono text-subtle dark:text-subtle-dark mt-1.5">
              {formatDate(job.posted_at)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function MatchScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-600 dark:text-emerald-400" :
    score >= 50 ? "text-amber-600 dark:text-amber-400" :
    "text-red-600 dark:text-red-400";

  return (
    <span className={`text-xs font-mono font-medium ${color}`}>
      {score}% match
    </span>
  );
}
