
import {
  Github,
  Linkedin,
  Mail,
  Menu,
  Moon,
  Search,
  Sun,
  X,
  Code2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChatAssistant } from "../components/ChatAssistant";
import { ScrollToTop } from "../components/ScrollToTop";
import { SearchDialog } from "../components/SearchDialog";
import { useProfile } from "../hooks/useProfile";
import { useTheme } from "../hooks/useTheme";
import { api } from "../services/api";
import { safeHref } from "../utils/format";

const links = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/certifications", label: "Certifications" },
  { to: "/resume", label: "Resume" },
  { to: "/contact", label: "Contact" },
];

export function PublicLayout() {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const { theme, toggle } = useTheme();
  const profile = useProfile();
  const { pathname } = useLocation();

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    void api.track("PAGE_VIEW", pathname);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        setSearch(true);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{
          borderColor: "var(--line)",
          background: "color-mix(in srgb, var(--bg) 80%, transparent)",
        }}
      >
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="font-mono text-lg font-bold">
            <span className="gradient-text">NY</span>
            <span className="muted">/dev</span>
          </Link>

          <nav
            aria-label="Main"
            className="hidden items-center gap-1 md:flex"
          >
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/5 ${
                    isActive ? "text-cyan-400" : "muted"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              className="btn-ghost !p-2"
              onClick={() => setSearch(true)}
              aria-label="Search (Ctrl+K)"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              className="btn-ghost !p-2"
              onClick={toggle}
              aria-label={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } theme`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              className="btn-ghost !p-2 md:hidden"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-controls="mobile-nav"
              aria-label="Toggle menu"
            >
              {menu ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {menu && (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="container-page flex flex-col gap-1 pb-3 md:hidden"
          >
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/5"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main id="main" className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="mt-20 border-t py-8 text-sm"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="container-page flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="muted">
            © {new Date().getFullYear()}{" "}
            {profile?.fullName ?? "Niraj Yadav"}.{" "}
            <Link to="/privacy" className="underline hover:text-cyan-400">
              Privacy
            </Link>
          </p>

          <div className="flex items-center gap-4">
            {/* GitHub */}
            {safeHref(profile?.githubUrl) && (
              <a
                aria-label="GitHub"
                href={safeHref(profile?.githubUrl)}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Profile"
                className="muted transition-colors hover:text-cyan-400"
              >
                <Github className="h-5 w-5" />
              </a>
            )}

            {/* LinkedIn */}
            {safeHref(profile?.linkedinUrl) && (
              <a
                aria-label="LinkedIn"
                href={safeHref(profile?.linkedinUrl)}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn Profile"
                className="muted transition-colors hover:text-cyan-400"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}

            {/* LeetCode */}
            <a
              aria-label="LeetCode"
              href="https://leetcode.com/u/Niraj_yadav123/"
              target="_blank"
              rel="noopener noreferrer"
              title="LeetCode Profile"
              className="muted transition-colors hover:text-cyan-400"
            >
              <Code2 className="h-5 w-5" />
            </a>

           
{/* Email */}
<a
  aria-label="Email"
  href="https://mail.google.com/mail/?view=cm&fs=1&to=ny420436@gmail.com"
  target="_blank"
  rel="noopener noreferrer"
  title="Send me an email"
  className="muted transition-colors hover:text-cyan-400"
>
  <Mail className="h-5 w-5" />
</a>

{/* Admin Login */}
<Link
  to="/admin/login"
  title="Admin Login"
  className="ml-2 text-xs muted transition-colors hover:text-cyan-400"
>
  Admin
</Link>

          </div>

        </div>
        
      </footer>

      <ScrollToTop />
      <ChatAssistant />
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </div>
    
  );
}
