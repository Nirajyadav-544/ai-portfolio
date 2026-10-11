import { ArrowUpRight, Github } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProjectCard as P } from "../types";
import { humanize, safeHref } from "../utils/format";
import { SampleBadge } from "./ui";

export function ProjectCard({ p }: { p: P }) {
  return (
    <article className="card card-hover flex h-full flex-col overflow-hidden">
      <div className="aspect-[16/9] w-full bg-gradient-to-br from-violet-600/30 via-blue-600/20 to-cyan-500/20">
        {p.coverImageUrl && <img src={p.coverImageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{p.category}</span>
          <span className="chip">{humanize(p.status)}</span>
          {p.featured && <span className="chip border-cyan-400/50 text-cyan-400">Featured</span>}
          {p.sample && <SampleBadge />}
        </div>
        <h3 className="text-lg font-semibold">
          <Link to={`/projects/${p.slug}`} className="hover:underline">{p.title}</Link>
        </h3>
        <p className="muted line-clamp-3 text-sm">{p.summary}</p>
        <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
          {p.technologies.slice(0, 5).map((t) => <li key={t} className="chip font-mono">{t}</li>)}
        </ul>
        <div className="mt-auto flex items-center gap-3 pt-2 text-sm">
          <Link to={`/projects/${p.slug}`} className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:underline">
            Details <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
          {safeHref(p.githubUrl) && (
            <a href={safeHref(p.githubUrl)} target="_blank" rel="noopener noreferrer" className="muted inline-flex items-center gap-1 hover:underline">
              <Github className="h-4 w-4" aria-hidden /> Code
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
