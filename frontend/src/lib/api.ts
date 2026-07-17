const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, config: RequestInit = {}): Promise<T> {
    let ep = endpoint;
    if (ep.endsWith("/") || ep.includes("?")) {
      // already has slash or query
    } else if (ep.split("/").length >= 3) {
      const parts = ep.split("?");
      if (!parts[0].endsWith("/")) {
        parts[0] += "/";
        ep = parts.join("?");
      }
    }

    const url = `${this.baseUrl}${ep}`;
    const headers: Record<string, string> = { ...config.headers as Record<string, string> };
    if (!(config.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, { ...config, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json();
  }

  private get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }
  private post<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "POST" });
  }

  async getJobs(params?: Record<string, unknown>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const qs = searchParams.toString();
    return this.get<PaginatedResponse<Job>>(`/api/jobs/${qs ? `?${qs}` : ""}`);
  }
  async getJob(id: string) {
    return this.get<Job>(`/api/jobs/${id}`);
  }
  async discoverJobs() {
    return this.post<DiscoverResult>("/api/jobs/discover");
  }
}

export const api = new ApiClient(API_BASE_URL);

export function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    if (diffHrs < 1) return "just now";
    if (diffHrs < 24) return `${Math.floor(diffHrs)}h ago`;
    const diffDays = diffHrs / 24;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return null;
  }
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

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}
