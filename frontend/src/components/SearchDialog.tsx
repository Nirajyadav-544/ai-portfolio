import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { useDebounce } from "../hooks/useDebounce";
import { api } from "../services/api";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const term = useDebounce(q.trim(), 250);
  const input = useRef<HTMLInputElement>(null);
  const nav = useNavigate();
  const { data, loading, error } = useAsync(
    () => (term.length >= 2 ? api.search(term) : Promise.resolve(null)), [term]);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const none = data && data.projects.length === 0 && data.skills.length === 0;
  return (
    <div role="dialog" aria-modal="true" aria-label="Search" className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-24"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card w-full max-w-xl bg-ink-900 p-4 dark:bg-ink-900">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 muted" aria-hidden />
          <input ref={input} className="input" placeholder="Search projects and skills" value={q} onChange={(e) => setQ(e.target.value)}
            aria-label="Search projects and skills" />
          <button className="btn-ghost !p-2" onClick={onClose} aria-label="Close search"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-3 max-h-80 overflow-auto text-sm" aria-live="polite">
          {term.length < 2 && <p className="muted p-2">Type at least 2 characters.</p>}
          {loading && term.length >= 2 && <p className="muted p-2">Searching…</p>}
          {error && <p className="p-2 text-red-400">{error.message}</p>}
          {none && <p className="muted p-2">No matches for “{term}”.</p>}
          {data?.projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.slug}`} onClick={onClose} className="block rounded-lg p-2 hover:bg-white/5">
              <span className="font-semibold">{p.title}</span> <span className="muted">· project</span>
            </Link>
          ))}
          {data?.skills.map((s) => (
            <button key={s.id} className="block w-full rounded-lg p-2 text-left hover:bg-white/5"
              onClick={() => { onClose(); nav(`/projects?tech=${encodeURIComponent(s.name)}`); }}>
              <span className="font-semibold">{s.name}</span> <span className="muted">· skill, see related projects</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
