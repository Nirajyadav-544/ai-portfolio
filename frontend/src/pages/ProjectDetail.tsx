import { ExternalLink, Github } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ProjectCard } from "../components/ProjectCard";
import { Breadcrumbs, ErrorState, SampleBadge, Spinner } from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { useSeo } from "../hooks/useSeo";
import { api } from "../services/api";
import { humanize, safeHref } from "../utils/format";
import NotFound from "./NotFound";

function Block({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return <section className="card p-6"><h2 className="mb-2 text-lg font-semibold">{title}</h2><p className="muted whitespace-pre-line">{text}</p></section>;
}

export default function ProjectDetail() {
  const { slug = "" } = useParams();
  const { data, loading, error, reload } = useAsync(() => api.project(slug), [slug]);
  const p = data?.project;
  useSeo(p?.title ?? "Project", p?.summary);
  useEffect(() => { if (p) void api.track("PROJECT_VIEW", `/projects/${p.slug}`, p.slug); }, [p]);

  if (loading) return <Spinner />;
  if (error?.status === 404) return <NotFound />;
  if (error || !data || !p) return <ErrorState error={error ?? "Project unavailable"} onRetry={reload} />;

  return (
    <article className="container-page py-12">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Projects", to: "/projects" }, { label: p.title }]} />
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap gap-2"><span className="chip">{p.category}</span><span className="chip">{humanize(p.status)}</span>{p.sample && <SampleBadge />}</div>
        <h1 className="text-4xl font-extrabold tracking-tight">{p.title}</h1>
        <p className="muted mt-3 max-w-3xl text-lg">{p.summary}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {safeHref(p.githubUrl) && <a className="btn-ghost" href={safeHref(p.githubUrl)} target="_blank" rel="noopener noreferrer"><Github className="h-4 w-4" aria-hidden /> Repository</a>}
          {safeHref(p.liveUrl) && <a className="btn-primary" href={safeHref(p.liveUrl)} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" aria-hidden /> Live demo</a>}
        </div>
      </header>
      {p.coverImageUrl && <img src={p.coverImageUrl} alt={`${p.title} cover`} loading="lazy" className="card mb-8 w-full object-cover" />}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Block title="Overview" text={p.description} />
          <Block title="Problem" text={p.problem} />
          <Block title="Solution" text={p.solution} />
          <Block title="Architecture" text={p.architecture} />
          {p.screenshots.length > 0 && (
            <section aria-label="Screenshots" className="grid gap-4 sm:grid-cols-2">
              {p.screenshots.map((s, i) => <img key={s} src={s} alt={`${p.title} screenshot ${i + 1}`} loading="lazy" className="card w-full" />)}
            </section>
          )}
        </div>
        <aside className="space-y-6">
          <section className="card p-6"><h2 className="mb-3 font-semibold">Tech stack</h2><ul className="flex flex-wrap gap-2">{p.technologies.map((t) => <li key={t}><Link className="chip font-mono hover:bg-white/5" to={`/projects?tech=${encodeURIComponent(t)}`}>{t}</Link></li>)}</ul></section>
          {p.keyFeatures.length > 0 && <section className="card p-6"><h2 className="mb-3 font-semibold">Key features</h2><ul className="muted list-disc space-y-1 pl-5 text-sm">{p.keyFeatures.map((f) => <li key={f}>{f}</li>)}</ul></section>}
        </aside>
      </div>
      {data.related.length > 0 && (
        <section className="mt-14" aria-labelledby="related"><h2 id="related" className="mb-4 text-2xl font-bold">Related projects</h2>
          <ul className="grid gap-6 md:grid-cols-3">{data.related.map((r) => <li key={r.id}><ProjectCard p={r} /></li>)}</ul></section>
      )}
    </article>
  );
}
