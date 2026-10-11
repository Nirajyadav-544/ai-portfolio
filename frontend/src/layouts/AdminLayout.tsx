import { BarChart3, BookOpen, Briefcase, Award, FolderKanban, GraduationCap, Inbox, LogOut, Sparkles, User } from "lucide-react";
import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { Spinner } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

const items = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/skills", label: "Skills", icon: Sparkles },
  { to: "/admin/certificates", label: "Certificates", icon: Award },
  { to: "/admin/education", label: "Education", icon: GraduationCap },
  { to: "/admin/experience", label: "Experience", icon: Briefcase },
  { to: "/admin/profile", label: "Profile & links", icon: User },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
];

export function AdminLayout() {
  const { user, ready, logout } = useAuth();
  if (!ready) return <Spinner label="Checking session" />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return (
    <div className="container-page grid gap-6 py-6 md:grid-cols-[14rem_1fr]">
      <aside className="card h-fit p-3 md:sticky md:top-4">
        <p className="px-3 py-2 text-xs muted">Signed in as<br /><span className="font-semibold" style={{ color: "var(--fg)" }}>{user.email}</span></p>
        <nav aria-label="Admin" className="flex flex-row gap-1 overflow-x-auto md:flex-col">
          {items.map(({ to, label, icon: I, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/5 ${isActive ? "bg-violet-500/15 text-violet-300" : "muted"}`}>
              <I className="h-4 w-4" aria-hidden /> {label}</NavLink>
          ))}
        </nav>
        <div className="mt-3 flex flex-col gap-1 border-t pt-3" style={{ borderColor: "var(--line)" }}>
          <Link to="/" className="muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5"><BookOpen className="h-4 w-4" aria-hidden /> View site</Link>
          <button onClick={() => void logout()} className="muted flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"><LogOut className="h-4 w-4" aria-hidden /> Sign out</button>
        </div>
      </aside>
      <section className="min-w-0"><Outlet /></section>
    </div>
  );
}
