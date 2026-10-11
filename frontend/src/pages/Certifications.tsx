import { BadgeCheck, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, Pagination, SampleBadge, SectionHeading, Spinner } from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { useDebounce } from "../hooks/useDebounce";
import { useSeo } from "../hooks/useSeo";
import { api } from "../services/api";
import { formatMonth, safeHref } from "../utils/format";

export default function Certifications() {
  useSeo("Certifications", "Verified certifications and credentials.");
  const [text, setText] = useState("");
  const [issuer, setIssuer] = useState("");
  const [page, setPage] = useState(0);
  const q = useDebounce(text.trim(), 300);
  const issuers = useAsync(() => api.issuers(), []);
  const list = useAsync(() => api.certificates({ q: q || undefined, issuer: issuer || undefined, page, size: 9 }), [q, issuer, page]);

  return (
    <div className="container-page py-12">
      <SectionHeading eyebrow="Credentials" title="Certifications" intro="Only entries with an official verification link are marked Verified. Anything else is shown as unverified." />
      <div className="mb-8 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div><label htmlFor="c-search" className="sr-only">Search certifications</label>
          <input id="c-search" className="input" placeholder="Search by title or issuer" value={text} onChange={(e) => { setText(e.target.value); setPage(0); }} /></div>
        <div><label htmlFor="c-issuer" className="sr-only">Issuer</label>
          <select id="c-issuer" className="input" value={issuer} onChange={(e) => { setIssuer(e.target.value); setPage(0); }}>
            <option value="">All issuers</option>{issuers.data?.map((i) => <option key={i}>{i}</option>)}</select></div>
      </div>
      {list.loading ? <Spinner /> : list.error ? <ErrorState error={list.error} onRetry={list.reload} /> :
        (list.data?.content.length ?? 0) === 0 ? <EmptyState title="No certifications to show" hint="Certificates appear here once they are added from the admin dashboard." /> : (
          <>
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {list.data?.content.map((c) => (
                <li key={c.id} className="card card-hover flex flex-col gap-2 p-5">
                  {c.imageUrl && <img src={c.imageUrl} alt={`${c.title} certificate`} loading="lazy" className="mb-2 aspect-[4/3] w-full rounded-lg object-cover" />}
                  <div className="flex flex-wrap gap-2">
                    {c.verified ? <span className="chip border-emerald-400/50 text-emerald-400"><BadgeCheck className="mr-1 h-3.5 w-3.5" aria-hidden /> Verified</span> : <span className="chip">Unverified</span>}
                    {c.sample && <SampleBadge />}{c.expired && <span className="chip border-red-400/50 text-red-400">Expired</span>}
                  </div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="muted text-sm">{c.issuer}</p>
                  <p className="muted text-xs">{c.issueDate && `Issued ${formatMonth(c.issueDate)}`}{c.expiryDate && ` · Expires ${formatMonth(c.expiryDate)}`}</p>
                  {c.credentialId && <p className="muted font-mono text-xs">ID: {c.credentialId}</p>}
                  <div className="mt-auto flex gap-3 pt-2 text-sm">
                    {safeHref(c.verificationUrl) && <a className="inline-flex items-center gap-1 text-cyan-400 hover:underline" href={safeHref(c.verificationUrl)} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" aria-hidden /> Verify</a>}
                    {safeHref(c.pdfUrl) && <a className="muted inline-flex items-center gap-1 hover:underline" href={safeHref(c.pdfUrl)} target="_blank" rel="noopener noreferrer"><FileText className="h-4 w-4" aria-hidden /> PDF</a>}
                  </div>
                </li>
              ))}
            </ul>
            <Pagination page={list.data?.page ?? 0} totalPages={list.data?.totalPages ?? 0} onChange={setPage} />
          </>
        )}
    </div>
  );
}
