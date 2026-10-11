import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { ErrorState, Spinner } from "../../components/ui";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../services/api";

function Stat({ label, value }: { label: string; value: number | string }) {
  return <div className="card p-4"><p className="muted text-xs uppercase tracking-wide">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>;
}

function Top({ title, rows }: { title: string; rows: { name: string; count: number }[] }) {
  return (
    <div className="card p-4"><h3 className="mb-2 font-semibold">{title}</h3>
      {rows.length === 0 ? <p className="muted text-sm">No data yet.</p> : <ul className="space-y-1 text-sm">{rows.map((r) => <li key={r.name} className="flex justify-between gap-3"><span className="truncate">{r.name}</span><span className="muted">{r.count}</span></li>)}</ul>}
    </div>
  );
}

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const overview = useAsync(() => api.admin.overview(), []);
  const analytics = useAsync(() => api.admin.analytics(days), [days]);
  const ai = useAsync(() => api.admin.aiStatus(), []);
  const a = analytics.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {overview.error ? <ErrorState error={overview.error} onRetry={overview.reload} /> : overview.data && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Projects" value={overview.data.projects} /><Stat label="Skills" value={overview.data.skills} />
          <Stat label="Certificates" value={overview.data.certificates} /><Stat label="Unread messages" value={overview.data.unreadMessages} />
        </div>
      )}
      <section className="card p-4" aria-labelledby="ai-h"><h2 id="ai-h" className="mb-2 font-semibold">AI assistant</h2>
        {ai.data ? (
          <p className="text-sm"><span className={`chip ${ai.data.configured ? "border-emerald-400/50 text-emerald-400" : "border-amber-400/50 text-amber-400"}`}>{ai.data.configured ? "Configured" : "Not configured (set GEMINI_API_KEY)"}</span>
            <span className="muted ml-3">{ai.data.provider} · {ai.data.model} · limit {ai.data.maxRequests} per {Math.round(ai.data.windowSeconds / 60)} min · conversations are not stored</span></p>
        ) : ai.error ? <p className="text-sm text-red-400">{ai.error.message}</p> : <p className="muted text-sm">Loading…</p>}
      </section>
      <section aria-labelledby="an-h" className="space-y-4">
        <div className="flex items-center justify-between"><h2 id="an-h" className="text-lg font-semibold">Analytics</h2>
          <div><label htmlFor="days" className="sr-only">Range</label><select id="days" className="input !w-auto" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></div></div>
        {analytics.loading ? <Spinner /> : analytics.error ? <ErrorState error={analytics.error} onRetry={analytics.reload} /> : a && (
          <>
            {!a.enabled && <p className="chip border-amber-400/50 text-amber-400">Analytics collection is turned off.</p>}
            {a.empty && <p className="muted text-sm">No events recorded yet. Charts show real traffic only; nothing here is demo data. Events are kept for {a.retentionDays} days.</p>}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Stat label="Page views" value={a.totals.PAGE_VIEW ?? 0} /><Stat label="Project views" value={a.totals.PROJECT_VIEW ?? 0} />
              <Stat label="Resume downloads" value={a.totals.RESUME_DOWNLOAD ?? 0} /><Stat label="Contact submits" value={a.totals.CONTACT_SUBMIT ?? 0} /><Stat label="AI chats" value={a.totals.AI_CHAT ?? 0} />
            </div>
            <div className="card h-72 p-4" role="img" aria-label="Daily traffic line chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={a.daily}><CartesianGrid strokeOpacity={0.15} /><XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} /><YAxis allowDecimals={false} width={30} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#111833", border: "1px solid #2a3566", borderRadius: 8 }} /><Legend />
                  <Line type="monotone" dataKey="pageViews" name="Page views" stroke="#7c3aed" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="projectViews" name="Project views" stroke="#06b6d4" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="aiChats" name="AI chats" stroke="#f59e0b" dot={false} strokeWidth={2} /></LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-4 md:grid-cols-3"><Top title="Top pages" rows={a.topPages} /><Top title="Top projects" rows={a.topProjects} /><Top title="Referrers" rows={a.topReferrers} /></div>
          </>
        )}
      </section>
    </div>
  );
}
