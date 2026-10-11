import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type {
  AiStatus, AnalyticsSummary, ApiErrorBody, AuthResponse, AuthUser, Certificate, ContactMessage, ContactStatus,
  Education, Experience, GithubResult, Overview, Page, Profile, ProjectCard, ProjectDetail, ProjectDetailResponse,
  Skill,
} from "../types";

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080";

export const http = axios.create({ baseURL, withCredentials: true, timeout: 30000 });

let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };
export const setSessionExpiredHandler = (fn: (() => void) | null) => { onSessionExpired = fn; };

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing: Promise<AuthResponse | null> | null = null;

export async function refreshSession(): Promise<AuthResponse | null> {
  if (!refreshing) {
    refreshing = http
      .post<AuthResponse>("/api/auth/refresh", null, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then((r) => { setAccessToken(r.data.accessToken); return r.data; })
      .catch(() => { setAccessToken(null); return null; })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

http.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const url = original?.url ?? "";
    if (error.response?.status === 401 && original && !original._retried && url.startsWith("/api/admin")) {
      original._retried = true;
      const session = await refreshSession();
      if (session) return http(original);
      onSessionExpired?.();
    }
    return Promise.reject(error);
  },
);

export interface FriendlyError { status: number; message: string; fieldErrors?: Record<string, string>; retryAfter?: number }

export function toFriendlyError(err: unknown): FriendlyError {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") return { status: 0, message: "The request timed out. Please try again." };
    if (!err.response) return { status: 0, message: "Cannot reach the server. Check your connection and try again." };
    const body = err.response.data as Partial<ApiErrorBody> | undefined;
    const retry = Number(err.response.headers["retry-after"]);
    return {
      status: err.response.status,
      message: body?.message ?? "Something went wrong. Please try again.",
      fieldErrors: body?.fieldErrors,
      retryAfter: Number.isFinite(retry) ? retry : undefined,
    };
  }
  return { status: 0, message: "Something went wrong. Please try again." };
}

const get = async <T,>(url: string, params?: Record<string, unknown>) => (await http.get<T>(url, { params })).data;

export const api = {
  profile: () => get<Profile>("/api/profile"),
  projects: (p: { q?: string; category?: string; tech?: string; featured?: boolean; page?: number; size?: number }) =>
    get<Page<ProjectCard>>("/api/projects", p),
  projectCategories: () => get<string[]>("/api/projects/categories"),
  projectTechnologies: () => get<string[]>("/api/projects/technologies"),
  project: (slug: string) => get<ProjectDetailResponse>(`/api/projects/${encodeURIComponent(slug)}`),
  skills: () => get<Skill[]>("/api/skills"),
  certificates: (p: { q?: string; issuer?: string; verified?: boolean; page?: number; size?: number }) =>
    get<Page<Certificate>>("/api/certificates", p),
  issuers: () => get<string[]>("/api/certificates/issuers"),
  education: () => get<Education[]>("/api/education"),
  experience: () => get<Experience[]>("/api/experience"),
  github: () => get<GithubResult>("/api/github/repos"),
  search: (q: string) => get<{ projects: ProjectCard[]; skills: Skill[] }>("/api/search", { q }),
  contact: async (b: { name: string; email: string; subject: string; message: string; website?: string }) =>
    (await http.post<{ message: string }>("/api/contact", b)).data,
  chat: async (message: string, history: { role: "user" | "assistant"; content: string }[]) =>
    (await http.post<{ reply: string }>("/api/ai/chat", { message, history }, { timeout: 35000 })).data,
  track: (type: "PAGE_VIEW" | "PROJECT_VIEW" | "RESUME_DOWNLOAD", path?: string, targetId?: string) => {
    const referrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined;
    return http.post("/api/analytics/events", { type, path, referrer, targetId }).catch(() => undefined);
  },
  login: async (email: string, password: string) => (await http.post<AuthResponse>("/api/auth/login", { email, password })).data,
  logout: () => http.post("/api/auth/logout", null, { headers: { "X-Requested-With": "XMLHttpRequest" } }).catch(() => undefined),
  me: () => get<AuthUser>("/api/auth/me"),
  admin: {
    overview: () => get<Overview>("/api/admin/overview"),
    analytics: (days: number) => get<AnalyticsSummary>("/api/admin/analytics/summary", { days }),
    aiStatus: () => get<AiStatus>("/api/admin/ai/status"),
    updateProfile: async (b: unknown) => (await http.put<Profile>("/api/admin/profile", b)).data,
    list: <T,>(resource: string, params: Record<string, unknown>) => get<Page<T>>(`/api/admin/${resource}`, params),
    create: async (resource: string, b: unknown) => (await http.post(`/api/admin/${resource}`, b)).data,
    update: async (resource: string, id: number, b: unknown) => (await http.put(`/api/admin/${resource}/${id}`, b)).data,
    remove: async (resource: string, id: number) => { await http.delete(`/api/admin/${resource}/${id}`); },
    messages: (status: ContactStatus | "", page: number) =>
      get<Page<ContactMessage>>("/api/admin/messages", { status: status || undefined, page, size: 10 }),
    setMessageStatus: async (id: number, status: ContactStatus) =>
      (await http.patch<ContactMessage>(`/api/admin/messages/${id}/status`, { status })).data,
    projectsFull: (q: string, page: number) => get<Page<ProjectDetail>>("/api/admin/projects", { q: q || undefined, page, size: 10 }),
  },
};
