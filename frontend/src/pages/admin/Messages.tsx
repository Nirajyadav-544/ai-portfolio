import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyState, ErrorState, Pagination, Spinner } from "../../components/ui";
import { useAsync } from "../../hooks/useAsync";
import { api, toFriendlyError } from "../../services/api";
import type { ContactMessage, ContactStatus } from "../../types";
import { formatDateTime } from "../../utils/format";

const STATUSES: ContactStatus[] = ["NEW", "READ", "REPLIED", "ARCHIVED", "SPAM"];

export default function Messages() {
  const [status, setStatus] = useState<ContactStatus | "">("");
  const [page, setPage] = useState(0);
  const list = useAsync(() => api.admin.messages(status, page), [status, page]);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function change(m: ContactMessage, s: ContactStatus) {
    try { await api.admin.setMessageStatus(m.id, s); list.reload(); } catch (e) { setNote(toFriendlyError(e).message); }
  }
  async function remove() {
    if (!deleting) return;
    try { await api.admin.remove("messages", deleting.id); setDeleting(null); list.reload(); } catch (e) { setNote(toFriendlyError(e).message); setDeleting(null); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Messages</h1>
        <div><label htmlFor="m-status" className="sr-only">Filter by status</label>
          <select id="m-status" className="input !w-auto" value={status} onChange={(e) => { setStatus(e.target.value as ContactStatus | ""); setPage(0); }}><option value="">All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div></div>
      {note && <p role="alert" className="chip border-red-400/50 text-red-300">{note}</p>}
      {list.loading ? <Spinner /> : list.error ? <ErrorState error={list.error} onRetry={list.reload} /> : (list.data?.content.length ?? 0) === 0 ? <EmptyState title="No messages" /> : (
        <>
          <ul className="space-y-3">{list.data?.content.map((m) => (
            <li key={m.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="font-semibold">{m.subject}</p><p className="muted text-xs">{m.name} · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a> · {formatDateTime(m.createdAt)}</p></div>
                <div className="flex items-center gap-2"><label className="sr-only" htmlFor={`s-${m.id}`}>Status</label>
                  <select id={`s-${m.id}`} className="input !w-auto !py-1.5" value={m.status} onChange={(e) => void change(m, e.target.value as ContactStatus)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                  <button className="btn-ghost !p-2 text-red-400" aria-label={`Delete message ${m.subject}`} onClick={() => setDeleting(m)}><Trash2 className="h-4 w-4" /></button></div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
            </li>))}</ul>
          <Pagination page={list.data?.page ?? 0} totalPages={list.data?.totalPages ?? 0} onChange={setPage} />
        </>
      )}
      {deleting && <ConfirmDialog title="Delete this message?" message={`The message from ${deleting.name} will be permanently deleted.`} onConfirm={() => void remove()} onCancel={() => setDeleting(null)} />}
    </div>
  );
}
