export function formatMonth(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatRange(start: string | null, end: string | null, openLabel: string): string {
  const s = formatMonth(start);
  const e = end ? formatMonth(end) : openLabel;
  if (!s && !end) return "";
  return `${s || "?"} – ${e}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
}

export function humanize(v: string): string {
  return v.toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function linesToList(v: string): string[] {
  return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return /^(https?:\/\/|\/|mailto:)/i.test(url) ? url : undefined;
}
