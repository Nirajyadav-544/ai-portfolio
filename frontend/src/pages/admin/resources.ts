import type { CrudConfig } from "../../features/CrudPage";

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

export const projectsConfig: CrudConfig = {
  resource: "projects", title: "Projects", searchable: true,
  primary: (r) => str(r.title), secondary: (r) => `${str(r.category)} · ${str(r.status)}`,
  defaults: { status: "IN_PROGRESS", displayOrder: 0, sample: false, featured: false },
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", hint: "Optional. Lowercase-with-hyphens. Generated from the title when empty." },
    { name: "summary", label: "Summary", type: "textarea", required: true },
    { name: "category", label: "Category", type: "text", required: true },
    { name: "status", label: "Status", type: "select", options: ["PLANNED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"] },
    { name: "description", label: "Description", type: "textarea" },
    { name: "problem", label: "Problem statement", type: "textarea" },
    { name: "solution", label: "Solution", type: "textarea" },
    { name: "architecture", label: "Architecture", type: "textarea" },
    { name: "technologies", label: "Technologies", type: "lines", hint: "One per line" },
    { name: "keyFeatures", label: "Key features", type: "lines", hint: "One per line" },
    { name: "screenshots", label: "Screenshot URLs", type: "lines", hint: "One per line (https://… or /path)" },
    { name: "coverImageUrl", label: "Cover image URL", type: "text" },
    { name: "githubUrl", label: "GitHub URL", type: "text" },
    { name: "liveUrl", label: "Live demo URL", type: "text" },
    { name: "displayOrder", label: "Display order", type: "number", required: true },
    { name: "featured", label: "Featured", type: "checkbox" },
    { name: "sample", label: "Sample / demo entry (not a real project)", type: "checkbox" },
  ],
};

export const skillsConfig: CrudConfig = {
  resource: "skills", title: "Skills", searchable: true,
  primary: (r) => str(r.name), secondary: (r) => str(r.category),
  defaults: { category: "FRONTEND", displayOrder: 0, sample: false },
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "category", label: "Category", type: "select", options: ["FRONTEND", "BACKEND", "DATABASE", "AI", "CLOUD", "TOOLS"] },
    { name: "icon", label: "Icon key", type: "text", hint: "react, code, palette, coffee, leaf, database, sparkles, container, git, cloud, server, bot, cpu" },
    { name: "proficiency", label: "Proficiency (0-100)", type: "number", hint: "Leave empty unless you want to show an honest level." },
    { name: "displayOrder", label: "Display order", type: "number", required: true },
    { name: "sample", label: "Sample entry", type: "checkbox" },
  ],
};

export const certificatesConfig: CrudConfig = {
  resource: "certificates", title: "Certificates", searchable: true,
  primary: (r) => str(r.title), secondary: (r) => `${str(r.issuer)} · ${r.verified ? "verified" : "unverified"}`,
  defaults: { verified: false, sample: false },
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "issuer", label: "Issuing organization", type: "text", required: true },
    { name: "issueDate", label: "Issue date", type: "date" },
    { name: "expiryDate", label: "Expiry date", type: "date" },
    { name: "credentialId", label: "Credential ID", type: "text" },
    { name: "verificationUrl", label: "Official verification URL", type: "text", hint: "Required to mark a certificate as verified." },
    { name: "imageUrl", label: "Image URL", type: "text" },
    { name: "pdfUrl", label: "PDF URL", type: "text" },
    { name: "verified", label: "Verified (official link confirmed)", type: "checkbox" },
    { name: "sample", label: "Sample entry", type: "checkbox" },
  ],
};

export const educationConfig: CrudConfig = {
  resource: "education", title: "Education",
  primary: (r) => str(r.degree), secondary: (r) => str(r.institution),
  defaults: { sample: false },
  fields: [
    { name: "institution", label: "Institution", type: "text", required: true },
    { name: "degree", label: "Degree", type: "text", required: true },
    { name: "fieldOfStudy", label: "Field of study", type: "text" },
    { name: "startDate", label: "Start date", type: "date" },
    { name: "endDate", label: "End date", type: "date", hint: "Leave empty if ongoing." },
    { name: "description", label: "Description", type: "textarea" },
    { name: "sample", label: "Sample entry", type: "checkbox" },
  ],
};

export const experienceConfig: CrudConfig = {
  resource: "experience", title: "Experience",
  primary: (r) => str(r.jobTitle), secondary: (r) => `${str(r.company)} · ${str(r.type)}`,
  defaults: { type: "WORK", sample: false },
  fields: [
    { name: "jobTitle", label: "Job title", type: "text", required: true },
    { name: "company", label: "Company / organization", type: "text", required: true },
    { name: "type", label: "Type", type: "select", options: ["WORK", "INTERNSHIP", "FREELANCE", "OPEN_SOURCE"] },
    { name: "location", label: "Location", type: "text" },
    { name: "startDate", label: "Start date", type: "date" },
    { name: "endDate", label: "End date", type: "date", hint: "Leave empty if current." },
    { name: "description", label: "Description", type: "textarea" },
    { name: "achievements", label: "Achievements", type: "lines", hint: "One per line. Only real, verifiable items." },
    { name: "sample", label: "Sample entry", type: "checkbox" },
  ],
};
