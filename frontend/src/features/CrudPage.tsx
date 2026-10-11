import { Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState, ErrorState, FieldError, Pagination, Spinner } from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { useDebounce } from "../hooks/useDebounce";
import { api, toFriendlyError } from "../services/api";
import { linesToList } from "../utils/format";

export interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "select" | "date" | "lines";
  options?: string[];
  required?: boolean;
  hint?: string;
  wide?: boolean;
}

export interface CrudConfig {
  resource: string;
  title: string;
  fields: Field[];
  searchable?: boolean;
  primary: (row: Record<string, unknown>) => string;
  secondary?: (row: Record<string, unknown>) => string;
  defaults?: Record<string, unknown>;
}

type Row = Record<string, unknown> & { id: number };

function toForm(fields: Field[], row?: Row, defaults: Record<string, unknown> = {}): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const f of fields) {
    const v = row ? row[f.name] : defaults[f.name];
    if (f.type === "checkbox") out[f.name] = Boolean(v);
    else if (f.type === "lines") out[f.name] = Array.isArray(v) ? (v as string[]).join("\n") : "";
    else out[f.name] = v === null || v === undefined ? (f.type === "select" ? f.options?.[0] ?? "" : "") : String(v);
  }
  return out;
}

function toPayload(fields: Field[], form: Record<string, string | boolean>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = form[f.name];
    if (f.type === "checkbox") out[f.name] = Boolean(v);
    else if (f.type === "lines") out[f.name] = linesToList(String(v));
    else if (f.type === "number") out[f.name] = String(v).trim() === "" ? (f.required ? 0 : null) : Number(v);
    else if (f.type === "date") out[f.name] = String(v) === "" ? null : String(v);
    else out[f.name] = String(v).trim();
  }
  return out;
}

export function CrudPage({ config }: { config: CrudConfig }) {
  const [page, setPage] = useState(0);
  const [text, setText] = useState("");
  const q = useDebounce(text.trim(), 300);
  const list = useAsync(() => api.admin.list<Row>(config.resource, { page, size: 10, q: q || undefined }), [config.resource, page, q]);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try { await api.admin.remove(config.resource, deleting.id); setDeleting(null); setNotice("Deleted."); list.reload(); }
    catch (e) { setNotice(toFriendlyError(e).message); setDeleting(null); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{config.title}</h1>
        <div className="flex items-center gap-2">
          {config.searchable && <><label htmlFor="crud-q" className="sr-only">Search</label><input id="crud-q" className="input !w-48" placeholder="Search" value={text} onChange={(e) => { setText(e.target.value); setPage(0); }} /></>}
          <button className="btn-primary" onClick={() => setEditing("new")}><Plus className="h-4 w-4" aria-hidden /> Add</button>
        </div>
      </div>
      {notice && <p role="status" className="chip">{notice}</p>}
      {list.loading ? <Spinner /> : list.error ? <ErrorState error={list.error} onRetry={list.reload} /> : (list.data?.content.length ?? 0) === 0 ? <EmptyState title="Nothing here yet" hint="Use Add to create the first entry." /> : (
        <>
          <ul className="space-y-2">
            {list.data?.content.map((row) => (
              <li key={row.id} className="card flex items-center justify-between gap-3 p-3">
                <div className="min-w-0"><p className="truncate font-medium">{config.primary(row)} {row.sample === true && <span className="chip border-amber-400/50 text-amber-400">sample</span>}</p>
                  {config.secondary && <p className="muted truncate text-xs">{config.secondary(row)}</p>}</div>
                <div className="flex shrink-0 gap-2">
                  <button className="btn-ghost !p-2" aria-label={`Edit ${config.primary(row)}`} onClick={() => setEditing(row)}><Pencil className="h-4 w-4" /></button>
                  <button className="btn-ghost !p-2 text-red-400" aria-label={`Delete ${config.primary(row)}`} onClick={() => setDeleting(row)}><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={list.data?.page ?? 0} totalPages={list.data?.totalPages ?? 0} onChange={setPage} />
        </>
      )}
      {editing && <EditDialog config={config} row={editing === "new" ? undefined : editing} onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); setNotice("Saved."); list.reload(); }} />}
      {deleting && <ConfirmDialog title="Delete this entry?" message={`“${config.primary(deleting)}” will be permanently removed. This cannot be undone.`} busy={busy} onConfirm={() => void confirmDelete()} onCancel={() => setDeleting(null)} />}
    </div>
  );
}

function EditDialog({ config, row, onClose, onSaved }: { config: CrudConfig; row?: Row; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(() => toForm(config.fields, row, config.defaults));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const missing: Record<string, string> = {};
    for (const f of config.fields) if (f.required && f.type !== "checkbox" && String(form[f.name]).trim() === "") missing[f.name] = "This field is required";
    setErrors(missing);
    if (Object.keys(missing).length) return;
    setBusy(true); setError(null);
    try {
      const payload = toPayload(config.fields, form);
      if (row) await api.admin.update(config.resource, row.id, payload); else await api.admin.create(config.resource, payload);
      onSaved();
    } catch (err) {
      const f = toFriendlyError(err);
      setErrors(f.fieldErrors ?? {}); setError(f.message);
    } finally { setBusy(false); }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={row ? "Edit entry" : "Add entry"} className="fixed inset-0 z-50 overflow-auto bg-black/60 p-4">
      <form onSubmit={submit} noValidate className="card mx-auto my-6 w-full max-w-2xl space-y-4 bg-ink-900 p-6">
        <h2 className="text-lg font-semibold">{row ? "Edit" : "Add"} {config.title.toLowerCase()}</h2>
        {error && <p role="alert" className="rounded-lg border border-red-400/40 p-3 text-sm text-red-300">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {config.fields.map((f) => {
            const id = `f-${f.name}`;
            const wide = f.wide || f.type === "textarea" || f.type === "lines";
            return (
              <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
                {f.type === "checkbox" ? (
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form[f.name])} onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })} /> {f.label}</label>
                ) : (
                  <>
                    <label className="label" htmlFor={id}>{f.label}{f.required && " *"}</label>
                    {f.type === "textarea" || f.type === "lines" ? <textarea id={id} rows={f.type === "lines" ? 4 : 5} className="input" value={String(form[f.name])} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                      : f.type === "select" ? <select id={id} className="input" value={String(form[f.name])} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>
                      : <input id={id} className="input" type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} value={String(form[f.name])} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} aria-invalid={!!errors[f.name]} />}
                    {f.hint && <p className="muted mt-1 text-xs">{f.hint}</p>}
                  </>
                )}
                <FieldError message={errors[f.name]} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-3"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button></div>
      </form>
    </div>
  );
}
