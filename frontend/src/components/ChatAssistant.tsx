import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { api, toFriendlyError } from "../services/api";

interface Msg { role: "user" | "assistant"; content: string; error?: boolean }

const SUGGESTIONS = ["What projects have you built?", "Which technologies do you use most?", "Tell me about your education."];

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastFailed, setLastFailed] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs, busy, open]);
  useEffect(() => { if (open) box.current?.focus(); }, [open]);

  async function send(message: string) {
    const m = message.trim();
    if (!m || busy) return;
    const history = msgs.filter((x) => !x.error).map(({ role, content }) => ({ role, content }));
    setMsgs((p) => [...p.filter((x) => !x.error), { role: "user", content: m }]);
    setText("");
    setBusy(true);
    setLastFailed(null);
    try {
      const r = await api.chat(m, history);
      setMsgs((p) => [...p, { role: "assistant", content: r.reply }]);
    } catch (e) {
      const f = toFriendlyError(e);
      const extra = f.status === 429 && f.retryAfter ? ` Try again in about ${f.retryAfter} seconds.` : "";
      setMsgs((p) => [...p, { role: "assistant", content: f.message + extra, error: true }]);
      setLastFailed(m);
    } finally { setBusy(false); }
  }

  function onSubmit(e: FormEvent) { e.preventDefault(); void send(text); }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Open AI assistant"
          className="btn-primary fixed bottom-6 right-6 z-40 !rounded-full !p-4">
          <MessageCircle className="h-5 w-5" aria-hidden />
        </button>
      )}
      {open && (
        <section aria-label="AI portfolio assistant" className="card fixed bottom-4 right-4 z-40 flex h-[32rem] max-h-[85vh] w-[calc(100vw-2rem)] max-w-sm flex-col bg-ink-900 shadow-glow">
          <header className="flex items-center justify-between border-b p-3" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center gap-2 font-semibold"><Bot className="h-5 w-5 text-cyan-400" aria-hidden /> Portfolio assistant</div>
            <button className="btn-ghost !p-1.5" aria-label="Close assistant" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-auto p-3 text-sm" role="log" aria-live="polite">
            {msgs.length === 0 && (
              <div className="space-y-2">
                <p className="muted">Ask about projects, skills, education or experience. Answers come only from the data on this site.</p>
                {SUGGESTIONS.map((s) => <button key={s} className="chip block w-full text-left hover:bg-white/5" onClick={() => void send(s)}>{s}</button>)}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <p className={`inline-block max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-left ${
                  m.role === "user" ? "bg-violet-600 text-white" : m.error ? "border border-red-400/40 text-red-300" : "bg-white/10"}`}>
                  {m.content}
                </p>
              </div>
            ))}
            {lastFailed && !busy && <button className="btn-ghost !py-1.5 text-xs" onClick={() => void send(lastFailed)}>Retry</button>}
            {busy && <p className="muted flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Thinking…</p>}
            <div ref={end} />
          </div>
          <form onSubmit={onSubmit} className="flex items-end gap-2 border-t p-3" style={{ borderColor: "var(--line)" }}>
            <label htmlFor="chat-input" className="sr-only">Your question</label>
            <textarea id="chat-input" ref={box} rows={1} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(text); } }}
              className="input max-h-28 resize-none" placeholder="Ask a question…" />
            <button className="btn-primary !p-2.5" type="submit" disabled={busy || !text.trim()} aria-label="Send"><Send className="h-4 w-4" /></button>
          </form>
        </section>
      )}
    </>
  );
}
