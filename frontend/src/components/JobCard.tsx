"use client";

import { useRouter } from "next/navigation";
import { Job, formatDate, formatSalary } from "@/lib/api";
import { scoreClasses } from "./MatchScore";
import Badge from "./Badge";

interface JobCardProps {
  job: Job;
  showMatchScore?: boolean;
  matchScore?: number;
  matchedSkills?: string[];
}

export default function JobCard({ job, showMatchScore = false, matchScore, matchedSkills }: JobCardProps) {
  const router = useRouter();
  const salary = formatSalary(job.salary_min, job.salary_max);
  const posted = formatDate(job.posted_at);

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
          {matchedSkills && matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {matchedSkills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="forest">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          {salary && (
            <p className="text-sm font-mono text-ember dark:text-ember-muted mb-1 tabular-nums">
              {salary}
            </p>
          )}
          <Badge variant="muted">{job.source_type}</Badge>
          {posted && (
            <p className="text-[10px] font-mono text-subtle dark:text-subtle-dark mt-1.5">
              {posted}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function MatchScoreBadge({ score }: { score: number }) {
  return (
    <span className={`text-xs font-mono font-medium ${scoreClasses(score).text}`}>
      {score}% match
    </span>
  );
}
