"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, formatDate, formatSalary, type Job } from "@/lib/api";
import { GROTESK } from "@/lib/fonts";

export const APPLIED_CHANGED_EVENT = "dm-applied-changed";

export function notifyAppliedChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(APPLIED_CHANGED_EVENT));
  }
}

interface AppliedDrawerProps {
  open: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

export default function AppliedDrawer({ open, onClose, onCountChange }: AppliedDrawerProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getJobs({ applied_only: true, limit: 100 });
      setJobs(res.items);
      setTotal(res.total);
      onCountChange?.(res.total);
    } catch {
      setError("Couldn't load applied jobs.");
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function undo(id: string) {
    if (busyId) return;
    setBusyId(id);
    try {
      await api.unmarkApplied(id);
      await load();
      notifyAppliedChanged();
    } catch {
      setError("Couldn't update this job.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-ink/30 dark:bg-black/50 transition-opacity duration-200 motion-reduce:transition-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Applied jobs"
        className={`fixed right-0 top-0 z-50 h-full w-[min(400px,100vw)] bg-surface dark:bg-surface-dark border-l border-border dark:border-border-dark flex flex-col transition-transform duration-200 ease-out motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-border dark:border-border-dark shrink-0">
          <div className="flex items-baseline gap-2">
            <h2 style={{ fontFamily: GROTESK }} className="font-bold text-[15px]">
              Applied
            </h2>
            <span className="font-mono text-[11px] text-subtle dark:text-subtle-dark tabular-nums">
              {total}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close applied jobs"
            className="p-2 -mr-2 rounded-lg hover:bg-surface-deep dark:hover:bg-surface-dark-deep transition-colors duration-200"
          >
            <svg className="w-4 h-4 text-muted dark:text-muted-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading && (
            <div className="p-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-border dark:border-white/10 p-4 animate-pulse">
                  <div className="h-3 w-2/3 rounded bg-surface-deep dark:bg-white/10" />
                  <div className="h-2.5 w-1/3 rounded bg-surface-deep dark:bg-white/10 mt-2.5" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="p-6 text-center">
              <p className="text-sm text-muted dark:text-muted-dark">{error}</p>
              <button
                onClick={() => void load()}
                className="mt-4 text-[13px] font-bold text-forest dark:text-forest-muted rounded px-4 py-2 hover:bg-forest/10 dark:hover:bg-forest-muted/10 transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="p-8 text-center">
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-subtle dark:text-subtle-dark">
                Nothing here yet
              </p>
              <p className="mt-2 text-sm text-muted dark:text-muted-dark leading-relaxed max-w-[30ch] mx-auto">
                Open any job and hit &ldquo;Mark as applied&rdquo; — it will show up in this list.
              </p>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <ul className="p-3 space-y-2">
              {jobs.map((job) => {
                const salary = formatSalary(job.salary_min, job.salary_max);
                const applied = formatDate(job.applied_at);
                return (
                  <li
                    key={job.id}
                    className="group rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1E1B18] p-3.5 hover:border-forest/40 dark:hover:border-forest-muted/40 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/jobs/${job.id}`}
                        onClick={onClose}
                        className="min-w-0 rounded"
                      >
                        <p
                          style={{ fontFamily: GROTESK }}
                          className="font-bold text-[14px] leading-snug text-ink dark:text-ink-dark truncate group-hover:text-forest dark:group-hover:text-forest-muted transition-colors duration-200"
                        >
                          {job.title}
                        </p>
                        <p className="text-[12px] text-muted dark:text-muted-dark mt-0.5 truncate">
                          {job.company?.name ?? "Unknown"}
                          {job.location ? ` · ${job.location}` : ""}
                        </p>
                      </Link>
                      <button
                        onClick={() => void undo(job.id)}
                        disabled={busyId === job.id}
                        className="shrink-0 font-mono text-[11px] text-subtle dark:text-subtle-dark rounded px-2 py-1 hover:text-ink dark:hover:text-ink-dark hover:bg-surface-deep dark:hover:bg-white/10 transition-colors duration-200 disabled:opacity-50"
                      >
                        {busyId === job.id ? "…" : "undo"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      {applied && (
                        <span className="font-mono text-[10px] text-forest dark:text-forest-muted">
                          Applied {applied}
                        </span>
                      )}
                      {salary && (
                        <span className="font-mono text-[10px] text-subtle dark:text-subtle-dark tabular-nums">
                          {salary}
                        </span>
                      )}
                      {job.source_type && (
                        <span className="font-mono text-[10px] text-subtle dark:text-subtle-dark">
                          {job.source_type}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
              {total > jobs.length && (
                <li className="pt-1 pb-2 text-center font-mono text-[11px] text-subtle dark:text-subtle-dark">
                  showing {jobs.length} of {total}
                </li>
              )}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
