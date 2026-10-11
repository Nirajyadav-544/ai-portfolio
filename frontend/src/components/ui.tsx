import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { FriendlyError } from "../services/api";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 py-12 muted">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> <span>{label}…</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: FriendlyError | string; onRetry?: () => void }) {
  const message = typeof error === "string" ? error : error.message;
  return (
    <div role="alert" className="card mx-auto my-6 flex max-w-xl flex-col items-center gap-3 p-6 text-center">
      <AlertTriangle className="h-7 w-7 text-amber-400" aria-hidden />
      <p>{message}</p>
      {onRetry && (
        <button className="btn-ghost" onClick={onRetry}><RefreshCw className="h-4 w-4" aria-hidden /> Try again</button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="card mx-auto my-6 flex max-w-xl flex-col items-center gap-2 p-8 text-center">
      <Inbox className="h-7 w-7 muted" aria-hidden />
      <h3 className="font-semibold">{title}</h3>
      {hint && <p className="muted text-sm">{hint}</p>}
      {action}
    </div>
  );
}

export function SampleBadge({ label = "Sample entry" }: { label?: string }) {
  return <span className="chip border-amber-400/50 text-amber-400" title="Demo data, not a real accomplishment">{label}</span>;
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.45, delay }}>
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="mb-2 font-mono text-xs uppercase tracking-widest text-cyan-400">{eyebrow}</p>}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {intro && <p className="muted mt-3 max-w-2xl">{intro}</p>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {it.to ? <Link className="hover:underline" to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
      <button className="btn-ghost" disabled={page <= 0} onClick={() => onChange(page - 1)}>Previous</button>
      <span className="muted text-sm" aria-live="polite">Page {page + 1} of {totalPages}</span>
      <button className="btn-ghost" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p role="alert" className="field-error">{message}</p> : null;
}
