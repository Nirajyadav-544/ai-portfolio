
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Download,
  Github,
  Linkedin,
  Mail,
  Terminal,
  Globe,
  MapPin,
  Twitter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SkillIcon } from "../components/Icon";
import { ProjectCard } from "../components/ProjectCard";
import {
  EmptyState,
  ErrorState,
  Reveal,
  SampleBadge,
  SectionHeading,
  Spinner,
} from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { useProfile } from "../hooks/useProfile";
import { useSeo } from "../hooks/useSeo";
import { api } from "../services/api";
import type { GithubResult, SkillCategory } from "../types";
import { formatRange, humanize, safeHref } from "../utils/format";
import { CodingActivity } from "../components/CodingActivity";
const CATEGORIES: SkillCategory[] = [
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "AI",
  "CLOUD",
  "TOOLS",
  
];

function RoleTicker({ roles }: { roles: string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || roles.length < 2) return;

    const t = setInterval(() => {
      setI((x) => (x + 1) % roles.length);
    }, 2600);

    return () => clearInterval(t);
  }, [roles, reduce]);

  if (roles.length === 0) return null;

  return (
    <p className="font-mono text-lg text-cyan-400" aria-live="off">
      <span aria-hidden>&gt; </span>
      <motion.span
        key={roles[i]}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {roles[i]}
      </motion.span>
      <span aria-hidden className="animate-pulse">
        _
      </span>
    </p>
  );
}

const STATUS_STYLE = {
  AVAILABLE: "bg-emerald-400",
  OPEN_TO_OFFERS: "bg-cyan-400",
  BUSY: "bg-amber-400",
} as const;

function CodeVisual() {
  return (
    <div
      className="card hidden w-full max-w-sm p-5 font-mono text-xs leading-6 lg:block"
      aria-hidden
    >
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>
      <p>
        <span className="text-violet-400">const</span> developer = {"{"}
      </p>
      <p className="pl-4">
        stack: [<span className="text-cyan-400">"React"</span>,{" "}
        <span className="text-cyan-400">"Spring Boot"</span>],
      </p>
      <p className="pl-4">
        database: <span className="text-cyan-400">"PostgreSQL"</span>,
      </p>
      <p className="pl-4">
        ai: <span className="text-cyan-400">"Gemini"</span>,
      </p>
      <p className="pl-4">
        builds: <span className="text-violet-400">true</span>,
      </p>
      <p>{"}"};</p>
    </div>
  );
}

function GithubSection({ data }: { data: GithubResult }) {
  const warn = data.status !== "OK" && data.message;

  return (
    <div>
      {warn && (
        <p className="muted mb-4 text-sm" role="status">
          {data.message}{" "}
          {data.source === "projects"
            ? "Showing repositories linked from my projects."
            : ""}
        </p>
      )}

      {data.repos.length === 0 ? (
        <EmptyState
          title="No repositories to show yet"
          hint={
            data.status === "NOT_CONFIGURED"
              ? "A GitHub username has not been set up."
              : undefined
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.repos.slice(0, 6).map((r) => (
            <li key={r.url} className="card card-hover p-4">
              <a
                href={safeHref(r.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
              >
                {r.name}
              </a>

              {r.description && (
                <p className="muted mt-1 line-clamp-2 text-sm">
                  {r.description}
                </p>
              )}

              <p className="muted mt-3 flex flex-wrap gap-3 text-xs">
                {r.language && <span>{r.language}</span>}
                {r.stars !== null && <span>★ {r.stars}</span>}
                {r.forks !== null && <span>⑂ {r.forks}</span>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Home() {
  const profile = useProfile();

  useSeo("", profile?.headline ?? undefined);

  const featured = useAsync(
    () => api.projects({ featured: true, size: 3 }),
    []
  );
  const skills = useAsync(() => api.skills(), []);
  const education = useAsync(() => api.education(), []);
  const experience = useAsync(() => api.experience(), []);
  const github = useAsync(() => api.github(), []);

  const [filter, setFilter] = useState<SkillCategory | "ALL">("ALL");

  const shown = (skills.data ?? []).filter(
    (s) => filter === "ALL" || s.category === filter
  );

  const timeline = [
    ...(education.data ?? []).map((e) => ({
      key: `e${e.id}`,
      title: e.degree,
      org: e.institution,
      range: formatRange(e.startDate, e.endDate, "Ongoing"),
      sample: e.sample,
      sort: e.startDate ?? "",
    })),
    ...(experience.data ?? []).map((e) => ({
      key: `x${e.id}`,
      title: e.jobTitle,
      org: e.company,
      range: formatRange(e.startDate, e.endDate, "Present"),
      sample: e.sample,
      sort: e.startDate ?? "",
    })),
  ].sort((a, b) => b.sort.localeCompare(a.sort));

  return (
    <>
      {/* Hero */}
      <section
        className="container-page grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_auto]"
        aria-labelledby="hero-title"
      >
        <div className="space-y-5">
          {profile && (
            <p className="chip inline-flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  STATUS_STYLE[profile.availabilityStatus]
                }`}
                aria-hidden
              />
              {profile.availabilityMessage ||
                humanize(profile.availabilityStatus)}
            </p>
          )}

          <h1
            id="hero-title"
            className="text-4xl font-extrabold tracking-tight sm:text-6xl"
          >
            Hi, I'm{" "}
            <span className="gradient-text">
              {profile?.fullName || "Niraj Yadav"}
            </span>
          </h1>

          <p className="text-xl font-semibold">
            {profile?.title || "Full-Stack Developer"}
          </p>

          {profile?.headline && (
            <p className="muted max-w-2xl text-lg">
              {profile.headline}
            </p>
          )}

          {profile?.location && (
            <p className="muted flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" aria-hidden />
              {profile.location}
            </p>
          )}

          <RoleTicker roles={profile?.roles ?? []} />

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/projects" className="btn-primary">
              View Projects
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>

            {safeHref(profile?.resumeUrl) ? (
              <a
                className="btn-ghost"
                href={safeHref(profile?.resumeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                download
                onClick={() =>
                  void api.track("RESUME_DOWNLOAD", "/resume")
                }
              >
                <Download className="h-4 w-4" aria-hidden />
                Download Resume
              </a>
            ) : (
              <Link className="btn-ghost" to="/resume">
                <Download className="h-4 w-4" aria-hidden />
                Resume
              </Link>
            )}

            <Link to="/contact" className="btn-ghost">
              <Mail className="h-4 w-4" aria-hidden />
              Contact Me
            </Link>
          </div>

          {/* Social links */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {safeHref(profile?.githubUrl) && (
              <a
                aria-label="GitHub"
                className="muted hover:text-cyan-400"
                href={safeHref(profile?.githubUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </a>
            )}

            {safeHref(profile?.linkedinUrl) && (
              <a
                aria-label="LinkedIn"
                className="muted hover:text-cyan-400"
                href={safeHref(profile?.linkedinUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}

            {safeHref(profile?.twitterUrl) && (
              <a
                aria-label="Twitter or X"
                className="muted hover:text-cyan-400"
                href={safeHref(profile?.twitterUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}

            {safeHref(profile?.websiteUrl) && (
              <a
                aria-label="Personal website"
                className="muted hover:text-cyan-400"
                href={safeHref(profile?.websiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="h-5 w-5" />
              </a>
            )}

           
<a
  aria-label="Email"
  href="https://mail.google.com/mail/?view=cm&fs=1&to=ny420436@gmail.com"
  target="_blank"
  rel="noopener noreferrer"
  title="Send me an email"
  className="muted hover:text-cyan-400 transition-colors p-2"
>
  <Mail className="h-4 w-4" />
</a>

          </div>

          {profile?.email && (
            <p className="muted text-sm">
              Public email:{" "}
              <a
                className="break-all hover:text-cyan-400"
                href={`mailto:${profile.email}`}
              >
                {profile.email}
              </a>
            </p>
          )}
        </div>

        {/* Profile image or code visual */}
        {profile?.avatarUrl ? (
          <div className="flex justify-center lg:justify-end">
            <img
              src={profile.avatarUrl}
              alt={`${profile.fullName || "Developer"} profile`}
              className="h-40 w-40 rounded-full border-2 border-cyan-400/50 object-cover shadow-xl shadow-cyan-500/10 sm:h-52 sm:w-52"
              loading="lazy"
            />
          </div>
        ) : (
          <CodeVisual />
        )}
      </section>

      {/* About */}
      <section
        className="container-page py-12"
        id="about"
        aria-labelledby="about-title"
      >
        <Reveal>
          <SectionHeading eyebrow="About" title="About me" />

          <div className="grid gap-6 md:grid-cols-2">
            {profile?.bio && (
              <div className="card p-6">
                <h3 className="mb-2 font-semibold">Biography</h3>
                <p className="muted whitespace-pre-line">{profile.bio}</p>
              </div>
            )}

            <div className="space-y-6">
              {profile?.careerGoals && (
                <div className="card p-6">
                  <h3 className="mb-2 font-semibold">Career goals</h3>
                  <p className="muted whitespace-pre-line">
                    {profile.careerGoals}
                  </p>
                </div>
              )}

              {profile?.philosophy && (
                <div className="card p-6">
                  <h3 className="mb-2 font-semibold">
                    Development philosophy
                  </h3>
                  <p className="muted whitespace-pre-line">
                    {profile.philosophy}
                  </p>
                </div>
              )}

              {profile && profile.interests.length > 0 && (
                <div className="card p-6">
                  <h3 className="mb-2 font-semibold">Interests</h3>
                  <ul className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <li key={interest} className="chip">
                        {interest}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {timeline.length > 0 && (
          <Reveal className="mt-10">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Terminal
                className="h-4 w-4 text-cyan-400"
                aria-hidden
              />
              Education &amp; experience
            </h3>

            <ol
              className="relative space-y-5 border-l pl-6"
              style={{ borderColor: "var(--line)" }}
            >
              {timeline.map((item) => (
                <li key={item.key}>
                  <span
                    className="absolute -left-[5px] mt-2 h-2.5 w-2.5 rounded-full bg-cyan-400"
                    aria-hidden
                  />
                  <p className="font-semibold">
                    {item.title} {item.sample && <SampleBadge />}
                  </p>
                  <p className="muted text-sm">
                    {item.org}
                    {item.range && ` · ${item.range}`}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        )}
      </section>

      {/* Skills */}
      <section
        className="container-page py-12"
        id="skills"
        aria-labelledby="skills-title"
      >
        <SectionHeading
          eyebrow="Skills"
          title="Skills & technologies"
        />

        <div
          role="group"
          aria-label="Filter skills"
          className="mb-6 flex flex-wrap gap-2"
        >
          {(["ALL", ...CATEGORIES] as const).map((category) => (
            <button
              key={category}
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
              className={`chip transition hover:bg-white/5 ${
                filter === category
                  ? "border-violet-400 text-violet-300"
                  : ""
              }`}
            >
              {category === "ALL" ? "All" : humanize(category)}
            </button>
          ))}
        </div>

        {skills.loading ? (
          <Spinner />
        ) : skills.error ? (
          <ErrorState error={skills.error} onRetry={skills.reload} />
        ) : shown.length === 0 ? (
          <EmptyState title="No skills listed yet" />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((skill) => (
              <li
                key={skill.id}
                className="card card-hover flex items-center gap-3 p-4"
              >
                <span className="rounded-lg bg-violet-500/15 p-2 text-violet-300">
                  <SkillIcon
                    icon={skill.icon}
                    category={skill.category}
                  />
                </span>

                <div className="min-w-0">
                  <p className="truncate font-medium">{skill.name}</p>
                  <p className="muted text-xs">
                    {humanize(skill.category)}
                    {skill.sample ? " · sample" : ""}
                  </p>

                  {skill.proficiency !== null && (
                    <div
                      className="mt-1 h-1.5 w-full rounded bg-white/10"
                      role="img"
                      aria-label={`Proficiency ${skill.proficiency} of 100`}
                    >
                      <div
                        className="h-full rounded bg-gradient-to-r from-violet-500 to-cyan-400"
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Featured projects */}
      <section
        className="container-page py-12"
        aria-labelledby="featured-title"
      >
        <SectionHeading eyebrow="Work" title="Featured projects" />

        {featured.loading ? (
          <Spinner />
        ) : featured.error ? (
          <ErrorState error={featured.error} onRetry={featured.reload} />
        ) : (featured.data?.content.length ?? 0) === 0 ? (
          <EmptyState
            title="No featured projects yet"
            hint="Mark a project as featured in the admin dashboard."
          />
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.data?.content.map((project, i) => (
              <li key={project.id}>
                <Reveal delay={i * 0.06} className="h-full">
                  <ProjectCard p={project} />
                </Reveal>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <Link to="/projects" className="btn-ghost">
            All projects
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* GitHub repositories */}
      <section
        className="container-page py-12"
        aria-labelledby="github-title"
      >
        <SectionHeading
          eyebrow="Open source"
          title="GitHub repositories"
          intro="Pulled live from the public GitHub API and cached. Nothing here is estimated."
        />

        {github.loading ? (
          <Spinner />
        ) : github.error ? (
          <ErrorState error={github.error} onRetry={github.reload} />
        ) : github.data ? (
          <GithubSection data={github.data} />
        ) : null}
      </section>
       <CodingActivity />
    </>
  );
}

