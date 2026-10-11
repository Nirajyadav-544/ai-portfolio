import { useEffect, useRef } from "react";

export function ConfirmDialog({ title, message, confirmLabel = "Delete", busy, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel?: string; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancel.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="cd-title" aria-describedby="cd-msg" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card w-full max-w-md bg-ink-900 p-6">
        <h2 id="cd-title" className="text-lg font-semibold">{title}</h2>
        <p id="cd-msg" className="muted mt-2 text-sm">{message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button ref={cancel} className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" disabled={busy} onClick={onConfirm}>{busy ? "Working…" : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
