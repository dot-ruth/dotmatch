"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ResumeProfile, MatchedJob } from "@/lib/api";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import FileUpload from "@/components/FileUpload";
import JobCard from "@/components/JobCard";

export default function ResumePage() {
  const router = useRouter();
  const [resume, setResume] = useState<ResumeProfile | null>(null);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftSkills, setDraftSkills] = useState<string[]>([]);
  const [draftRoles, setDraftRoles] = useState<string[]>([]);
  const [draftExp, setDraftExp] = useState("");
  const [draftEdu, setDraftEdu] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [eduInput, setEduInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    loadResume();
  }, []);

  async function loadResume() {
    setLoadError(null);
    try {
      const profile = await api.getResumeProfile();
      setResume(profile);
      if (profile) {
        const matched = await api.getMatchedJobs({ limit: 10 });
        setMatchedJobs(matched);
      }
    } catch {
      setLoadError("We couldn't load your resume details or matches. Check your connection and try again.");
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
      setEditing(false);
      const matched = await api.getMatchedJobs({ limit: 10 });
      setMatchedJobs(matched);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setError(`We couldn't upload your resume: ${message}`);
      throw e;
    } finally {
      setUploading(false);
    }
  }

  function startEditing() {
    if (!resume) return;
    setDraftSkills(resume.skills);
    setDraftRoles(resume.job_titles);
    setDraftExp(resume.experience_years != null ? String(resume.experience_years) : "");
    setDraftEdu(resume.education);
    setSkillInput("");
    setRoleInput("");
    setEduInput("");
    setSaveError(null);
    setEditing(true);
  }

  function addUnique(list: string[], setter: (v: string[]) => void, value: string) {
    const v = value.trim();
    if (v && !list.some((item) => item.toLowerCase() === v.toLowerCase())) {
      setter([...list, v]);
    }
  }

  async function handleSave() {
    if (!resume) return;
    setSaving(true);
    setSaveError(null);
    try {
      // Empty experience keeps the stored value (the API treats null as "no change").
      const exp = draftExp.trim() === "" ? null : Number(draftExp);
      if (exp !== null && (!Number.isFinite(exp) || exp < 0)) {
        throw new Error("Experience must be a positive number of years.");
      }
      const updated = await api.updateResumeProfile({
        skills: draftSkills,
        job_titles: draftRoles,
        experience_years: exp,
        education: draftEdu,
      });
      setResume(updated);
      const matched = await api.getMatchedJobs({ limit: 10 });
      setMatchedJobs(matched);
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="space-y-6">
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
        <p className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-forest dark:text-forest-muted font-bold mb-2">
          <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-forest-muted" />
          Match
        </p>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink dark:text-ink-dark mb-1">
          My Resume
        </h1>
        <p className="text-sm text-muted dark:text-muted-dark">
          Upload your resume to get personalized job matches
        </p>
      </div>

      {loadError && (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert">
          <p className="text-sm">{loadError}</p>
          <Button size="sm" variant="secondary" onClick={loadResume}>Retry</Button>
        </div>
      )}

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
            {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
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
              <div className="flex items-center gap-2 shrink-0">
                {!editing && (
                  <Button variant="secondary" size="sm" onClick={startEditing}>
                    Edit
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => { setResume(null); setMatchedJobs([]); setEditing(false); }}>
                  Replace
                </Button>
              </div>
            </div>

            {/* Extracted Data */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Skills */}
              <div>
                <h3 className="text-xs font-mono text-subtle dark:text-subtle-dark uppercase tracking-wider mb-3">
                  Detected Skills
                </h3>
                {editing ? (
                  <ChipEditor
                    items={draftSkills}
                    onRemove={(v) => setDraftSkills(draftSkills.filter((s) => s !== v))}
                    inputValue={skillInput}
                    onInputChange={setSkillInput}
                    onAdd={() => { addUnique(draftSkills, setDraftSkills, skillInput); setSkillInput(""); }}
                    placeholder="Add a skill…"
                    variant="forest"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {resume.skills.length > 0 ? (
                      resume.skills.map((skill) => (
                        <Badge key={skill} variant="forest">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted dark:text-muted-dark">No skills detected</p>
                    )}
                  </div>
                )}
              </div>

              {/* Job Titles */}
              <div>
                <h3 className="text-xs font-mono text-subtle dark:text-subtle-dark uppercase tracking-wider mb-3">
                  Detected Roles
                </h3>
                {editing ? (
                  <ChipEditor
                    items={draftRoles}
                    onRemove={(v) => setDraftRoles(draftRoles.filter((t) => t !== v))}
                    inputValue={roleInput}
                    onInputChange={setRoleInput}
                    onAdd={() => { addUnique(draftRoles, setDraftRoles, roleInput); setRoleInput(""); }}
                    placeholder="Add a role…"
                    variant="default"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {resume.job_titles.length > 0 ? (
                      resume.job_titles.map((title) => (
                        <Badge key={title}>{title}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted dark:text-muted-dark">No roles detected</p>
                    )}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div>
                <h3 className="text-xs font-mono text-subtle dark:text-subtle-dark uppercase tracking-wider mb-3">
                  Experience
                </h3>
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={draftExp}
                      onChange={(e) => setDraftExp(e.target.value)}
                      placeholder="e.g. 3"
                      aria-label="Years of experience"
                      className="w-28 px-3 py-2 bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark text-ink dark:text-ink-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30 dark:focus:ring-forest-muted/30 focus:border-forest/50 dark:focus:border-forest-muted/50 transition-all duration-200 text-sm"
                    />
                    <span className="text-sm text-muted dark:text-muted-dark">years</span>
                  </div>
                ) : resume.experience_years ? (
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
                {editing ? (
                  <ChipEditor
                    items={draftEdu}
                    onRemove={(v) => setDraftEdu(draftEdu.filter((e) => e !== v))}
                    inputValue={eduInput}
                    onInputChange={setEduInput}
                    onAdd={() => { addUnique(draftEdu, setDraftEdu, eduInput); setEduInput(""); }}
                    placeholder="Add education…"
                    variant="default"
                    layout="list"
                  />
                ) : resume.education.length > 0 ? (
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

            {editing && (
              <div className="mt-6 pt-6 border-t border-border dark:border-border-dark">
                {saveError && <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">{saveError}</p>}
                <div className="flex items-center gap-3">
                  <Button size="sm" onClick={handleSave} disabled={saving} loading={saving}>
                    Save changes
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
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
                <JobCard
                  key={matched.job.id}
                  job={matched.job}
                  showMatchScore
                  matchScore={matched.match_score}
                  matchedSkills={matched.matched_skills}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ChipEditor({
  items,
  onRemove,
  inputValue,
  onInputChange,
  onAdd,
  placeholder,
  variant = "default",
  layout = "wrap",
}: {
  items: string[];
  onRemove: (value: string) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  placeholder: string;
  variant?: "default" | "forest";
  layout?: "wrap" | "list";
}) {
  const chipClass =
    variant === "forest"
      ? "bg-forest/10 dark:bg-forest-muted/10 text-forest dark:text-forest-muted border border-forest/20 dark:border-forest-muted/20"
      : "bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark text-muted dark:text-muted-dark";
  return (
    <div>
      <div className={layout === "wrap" ? "flex flex-wrap gap-1.5 mb-2" : "space-y-1.5 mb-2"}>
        {items.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono ${chipClass} ${layout === "list" ? "w-fit max-w-full" : ""}`}
          >
            <span className="truncate">{item}</span>
            <button
              type="button"
              onClick={() => onRemove(item)}
              aria-label={`Remove ${item}`}
              className="text-sm leading-none opacity-60 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted dark:text-muted-dark">None — add one below.</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex-1 min-w-0 px-3 py-2 bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark text-ink dark:text-ink-dark placeholder-subtle dark:placeholder-subtle-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30 dark:focus:ring-forest-muted/30 focus:border-forest/50 dark:focus:border-forest-muted/50 transition-all duration-200 text-sm"
        />
        <Button size="sm" variant="secondary" onClick={onAdd}>
          Add
        </Button>
      </div>
    </div>
  );
}
