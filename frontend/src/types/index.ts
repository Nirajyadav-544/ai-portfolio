export type Availability = "AVAILABLE" | "OPEN_TO_OFFERS" | "BUSY";
export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
export type SkillCategory = "FRONTEND" | "BACKEND" | "DATABASE" | "AI" | "CLOUD" | "TOOLS";
export type ExperienceType = "WORK" | "INTERNSHIP" | "FREELANCE" | "OPEN_SOURCE";
export type ContactStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED" | "SPAM";

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface Profile {
  fullName: string;
  title: string;
  headline: string | null;
  bio: string | null;
  careerGoals: string | null;
  philosophy: string | null;
  interests: string[];
  roles: string[];
  location: string | null;
  availabilityStatus: Availability;
  availabilityMessage: string | null;
  email: string | null;
  githubUsername: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  resumeUrl: string | null;
  avatarUrl: string | null;
}

export interface ProjectCard {
  id: number;
  slug: string;
  title: string;
  summary: string;
  category: string;
  status: ProjectStatus;
  featured: boolean;
  sample: boolean;
  coverImageUrl: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  technologies: string[];
}

export interface ProjectDetail extends ProjectCard {
  description: string | null;
  problem: string | null;
  solution: string | null;
  architecture: string | null;
  displayOrder: number;
  keyFeatures: string[];
  screenshots: string[];
}

export interface ProjectDetailResponse {
  project: ProjectDetail;
  related: ProjectCard[];
}

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
  icon: string | null;
  proficiency: number | null;
  sample: boolean;
  displayOrder: number;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  issueDate: string | null;
  expiryDate: string | null;
  expired: boolean;
  credentialId: string | null;
  imageUrl: string | null;
  pdfUrl: string | null;
  verificationUrl: string | null;
  verified: boolean;
  sample: boolean;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  sample: boolean;
}

export interface Experience {
  id: number;
  company: string;
  jobTitle: string;
  type: ExperienceType;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  achievements: string[];
  sample: boolean;
}

export interface GithubRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number | null;
  forks: number | null;
  updatedAt: string | null;
  topics: string[];
}

export interface GithubResult {
  status: "OK" | "STALE" | "RATE_LIMITED" | "UNAVAILABLE" | "NOT_CONFIGURED";
  source: string;
  message: string | null;
  username: string | null;
  repos: GithubRepo[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUser;
}

export interface AnalyticsSummary {
  days: number;
  retentionDays: number;
  enabled: boolean;
  empty: boolean;
  totals: Record<string, number>;
  daily: { date: string; pageViews: number; projectViews: number; resumeDownloads: number; contactSubmissions: number; aiChats: number }[];
  topPages: { name: string; count: number }[];
  topProjects: { name: string; count: number }[];
  topReferrers: { name: string; count: number }[];
}

export interface AiStatus {
  configured: boolean;
  provider: string;
  model: string;
  maxRequests: number;
  windowSeconds: number;
  timeoutSeconds: number;
  conversationsStored: boolean;
}

export interface Overview {
  projects: number;
  skills: number;
  certificates: number;
  education: number;
  experience: number;
  messages: number;
  unreadMessages: number;
}

export interface ApiErrorBody {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}
