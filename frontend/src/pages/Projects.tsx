import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ProjectCard } from "../components/ProjectCard";
import { EmptyState, ErrorState, Pagination, Reveal, SectionHeading, Spinner } from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { useDebounce } from "../hooks/useDebounce";
import { useSeo } from "../hooks/useSeo";
import { api } from "../services/api";
import { useEffect, useState } from "react";

export default function Projects() {
  useSeo("Projects", "Browse full-stack projects with problem statements, architecture and tech stacks.");
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";
  const tech = params.get("tech") ?? "";
  const page = Number(params.get("page") ?? "0") || 0;
  const [text, setText] = useState(params.get("q") ?? "");
  const q = useDebounce(text.trim(), 300);

  const cats = useAsync(() => api.projectCategories(), []);
  const techs = useAsync(() => api.projectTechnologies(), []);
  const list = useAsync(() => api.projects({ q: q || undefined, category: category || undefined, tech: tech || undefined, page, size: 9 }), [q, category, tech, page]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (q) next.set("q", q); else next.delete("q");
    if ((params.get("q") ?? "") !== q) { next.delete("page"); setParams(next, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function set(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  return (
    <div className="container-page py-12">
      <SectionHeading eyebrow="Portfolio" title="Projects" intro="Search, filter by category or technology, and open any project for the full story." />
      <div className="mb-8 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <label htmlFor="proj-search" className="sr-only">Search projects</label>
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 muted" aria-hidden />
          <input id="proj-search" className="input pl-9" placeholder="Search projects" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div><label htmlFor="proj-cat" className="sr-only">Category</label>
          <select id="proj-cat" className="input" value={category} onChange={(e) => set("category", e.target.value)}>
            <option value="">All categories</option>{cats.data?.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label htmlFor="proj-tech" className="sr-only">Technology</label>
          <select id="proj-tech" className="input" value={tech} onChange={(e) => set("tech", e.target.value)}>
            <option value="">All technologies</option>{techs.data?.map((c) => <option key={c}>{c}</option>)}</select></div>
      </div>
      {list.loading ? <Spinner /> : list.error ? <ErrorState error={list.error} onRetry={list.reload} /> :
        (list.data?.content.length ?? 0) === 0 ? (
          <EmptyState title="No projects match" hint="Try clearing the filters." action={<button className="btn-ghost" onClick={() => { setText(""); setParams({}); }}>Clear filters</button>} />
        ) : (
          <>
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.data?.content.map((p, i) => <li key={p.id}><Reveal delay={(i % 3) * 0.05} className="h-full"><ProjectCard p={p} /></Reveal></li>)}
            </ul>
            <Pagination page={list.data?.page ?? 0} totalPages={list.data?.totalPages ?? 0} onChange={(p) => set("page", String(p))} />
          </>
        )}
    </div>
  );
}
