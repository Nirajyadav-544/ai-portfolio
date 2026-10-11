import { Download } from "lucide-react";
import { EmptyState, ErrorState, SampleBadge, SectionHeading, Spinner } from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { useProfile } from "../hooks/useProfile";
import { useSeo } from "../hooks/useSeo";
import { api } from "../services/api";
import { formatRange, humanize, safeHref } from "../utils/format";

export default function Resume() {
  useSeo("Resume", "Education, experience and a downloadable resume.");
  const profile = useProfile();
  const exp = useAsync(() => api.experience(), []);
  const edu = useAsync(() => api.education(), []);
  const href = safeHref(profile?.resumeUrl);
  const isPdf = href?.toLowerCase().split("?")[0].endsWith(".pdf");

  return (
    <div className="container-page py-12">
      <SectionHeading eyebrow="Resume" title="Experience & education" />
      <div className="mb-10 flex flex-wrap items-center gap-3">
        {href ? <a className="btn-primary" href={href} target="_blank" rel="noopener noreferrer" download onClick={() => void api.track("RESUME_DOWNLOAD", "/resume")}><Download className="h-4 w-4" aria-hidden /> Download resume</a>
          : <p className="muted text-sm">A resume link has not been added yet.</p>}
      </div>
      {href && isPdf && <object data={href} type="application/pdf" className="card mb-10 h-[32rem] w-full" aria-label="Resume preview"><p className="p-4 muted">PDF preview is not supported in this browser. Use the download button.</p></object>}

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="exp-h"><h2 id="exp-h" className="mb-4 text-xl font-bold">Experience</h2>
          {exp.loading ? <Spinner /> : exp.error ? <ErrorState error={exp.error} onRetry={exp.reload} /> : (exp.data?.length ?? 0) === 0 ? <EmptyState title="No experience listed" hint="Experience will appear here once added." /> : (
            <ol className="space-y-4">{exp.data?.map((e) => (
              <li key={e.id} className="card p-5"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{e.jobTitle}</h3><span className="chip">{humanize(e.type)}</span>{e.sample && <SampleBadge />}</div>
                <p className="muted text-sm">{e.company}{e.location && ` · ${e.location}`} · {formatRange(e.startDate, e.endDate, "Present")}</p>
                {e.description && <p className="muted mt-2 text-sm whitespace-pre-line">{e.description}</p>}
                {e.achievements.length > 0 && <ul className="muted mt-2 list-disc pl-5 text-sm">{e.achievements.map((a) => <li key={a}>{a}</li>)}</ul>}</li>))}</ol>)}
        </section>
        <section aria-labelledby="edu-h"><h2 id="edu-h" className="mb-4 text-xl font-bold">Education</h2>
          {edu.loading ? <Spinner /> : edu.error ? <ErrorState error={edu.error} onRetry={edu.reload} /> : (edu.data?.length ?? 0) === 0 ? <EmptyState title="No education listed" hint="Education will appear here once added." /> : (
            <ol className="space-y-4">{edu.data?.map((e) => (
              <li key={e.id} className="card p-5"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{e.degree}{e.fieldOfStudy && `, ${e.fieldOfStudy}`}</h3>{e.sample && <SampleBadge />}</div>
                <p className="muted text-sm">{e.institution} · {formatRange(e.startDate, e.endDate, "Ongoing")}</p>
                {e.description && <p className="muted mt-2 text-sm whitespace-pre-line">{e.description}</p>}</li>))}</ol>)}
        </section>
      </div>
    </div>
  );
}
