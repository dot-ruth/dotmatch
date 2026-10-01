const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const CLIENT_ID_KEY = "dotmatch_client_id";

function getClientId(): string {
  if (typeof window === "undefined") return "default";
  try {
    let id = window.localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = window.crypto.randomUUID();
      window.localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return "default";
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, config: RequestInit = {}, timeoutMs = 30000): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = { ...config.headers as Record<string, string> };
    headers["X-Client-Id"] = getClientId();
    if (!(config.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...config, headers, signal: controller.signal });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "An error occurred" }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }
      return response.json();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("The server took too long to respond. It may be waking up — please retry.");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  private get<T>(endpoint: string, timeoutMs?: number): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, timeoutMs);
  }
  private post<T>(endpoint: string, timeoutMs?: number): Promise<T> {
    return this.request<T>(endpoint, { method: "POST" }, timeoutMs);
  }

  async getJobs(params?: Record<string, unknown>) {
    return this.get<PaginatedResponse<Job>>(`/api/jobs/${toQuery(params)}`);
  }
  async getJob(id: string) {
    return this.get<Job>(`/api/jobs/${id}`);
  }
  async discoverJobs() {
    // Discovery scrapes every source and can take a minute or more.
    return this.post<DiscoverResult>("/api/jobs/discover", 180000);
  }
  async getSourceCounts() {
    return this.get<JobSourceCount[]>("/api/jobs/sources");
  }
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<ResumeProfile>("/api/jobs/resume", { method: "POST", body: formData }, 90000);
  }
  async getResumeProfile() {
    return this.get<ResumeProfile | null>("/api/jobs/resume/profile");
  }
  async updateResumeProfile(patch: { skills?: string[]; job_titles?: string[]; experience_years?: number | null; education?: string[] }) {
    return this.request<ResumeProfile>("/api/jobs/resume/profile", { method: "PATCH", body: JSON.stringify(patch) });
  }
  async getMatchedJobs(params?: Record<string, unknown>) {
    return this.get<MatchedJob[]>(`/api/jobs/matched${toQuery(params)}`);
  }
}

function toQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) searchParams.append(key, String(value));
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const api = new ApiClient(API_BASE_URL);

export function formatSalary(min: number | null, max: number | null): string | null {
  if (!min || !max) return null;
  return `$${(min / 1000).toFixed(0)}k–$${(max / 1000).toFixed(0)}k`;
}

export function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return "just now";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 7 * 86400) return rtf.format(Math.round(diffSec / 86400), "day");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export interface Job {
  id: string;
  title: string;
  company: { id?: string; name: string } | null;
  location: string | null;
  remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  url: string | null;
  description: string | null;
  skills: string[];
  experience_level: string | null;
  employment_type: string | null;
  source_type: string | null;
  posted_at: string | null;
  created_at: string;
}

export interface DiscoverResult {
  message: string;
  new_jobs: number;
  sources_checked: number;
  errors: string[];
}

export interface JobSourceCount {
  source_type: string;
  job_count: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface ResumeProfile {
  id: string;
  filename: string;
  raw_text: string;
  skills: string[];
  job_titles: string[];
  experience_years: number | null;
  education: string[];
  created_at: string;
}

export interface MatchedJob {
  job: Job;
  match_score: number;
  matched_skills: string[];
}
