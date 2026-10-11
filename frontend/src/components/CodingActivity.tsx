
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Github, RefreshCw, Code2 } from "lucide-react";

const GITHUB_USERNAME = "Nirajyadav-544";
const LEETCODE_USERNAME = "Niraj_yadav123";
const REFRESH_MS = 5 * 60 * 1000;

type Contribution = {
  date: string;
  count: number;
  level: number;
};

type LeetCodeStats = {
  totalSolved?: number;
  totalQuestions?: number;
  acceptanceRate?: number;
  byDifficulty?: {
    easy?: number;
    medium?: number;
    hard?: number;
  };
};

type LeetCodeHeatmap = {
  totalSubmissions?: number;
  totalActiveDays?: number;
  currentStreak?: number;
  longestStreak?: number;
  dailyContributions?: Contribution[];
};

type GitHubData = {
  total?: { lastYear?: number };
  contributions?: Contribution[];
};

type ActivityData = {
  github?: GitHubData;
  leetcode?: LeetCodeStats;
  heatmap?: LeetCodeHeatmap;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function Heatmap({
  contributions,
}: {
  contributions: Contribution[];
}) {
  const days = contributions.slice(-364);

  if (!days.length) {
    return (
      <p className="muted text-sm">
        Activity calendar is not available right now.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid w-max grid-flow-col grid-rows-7 gap-1"
        aria-label="Daily coding activity"
      >
        {days.map((day) => (
          <span
            key={day.date}
            title={`${day.date}: ${day.count} contributions`}
            className="h-3 w-3 rounded-[3px]"
            style={{
              backgroundColor:
                day.count === 0
                  ? "var(--line)"
                  : `rgba(34, 211, 238, ${
                      Math.min(day.level || 1, 4) / 4
                    })`,
            }}
          />
        ))}
      </div>
      <p className="muted mt-2 text-xs">
        Last 52 weeks · Hover over a square to see its date and count.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--line)" }}
    >
      <p className="muted text-xs">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

export function CodingActivity() {
  const [data, setData] = useState<ActivityData>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);

    const results = await Promise.allSettled([
      getJson<GitHubData>(
        `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
      ),
      getJson<{ data: LeetCodeStats }>(
        `https://leetcode-stats.tashif.codes/${LEETCODE_USERNAME}/stats`
      ),
      getJson<{ data: LeetCodeHeatmap }>(
        `https://leetcode-stats.tashif.codes/${LEETCODE_USERNAME}/heatmap`
      ),
    ]);

    const nextErrors: string[] = [];

    setData((previous) => {
      const next = { ...previous };

      if (results[0].status === "fulfilled") {
        next.github = results[0].value;
      } else {
        nextErrors.push("GitHub activity could not be loaded.");
      }

      if (results[1].status === "fulfilled") {
        next.leetcode = results[1].value.data;
      } else {
        nextErrors.push("LeetCode problem stats could not be loaded.");
      }

      if (results[2].status === "fulfilled") {
        next.heatmap = results[2].value.data;
      } else {
        nextErrors.push("LeetCode heatmap could not be loaded.");
      }

      return next;
    });

    setErrors(nextErrors);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const githubContributions = data.github?.contributions ?? [];
  const leetcode = data.leetcode;
  const heatmap = data.heatmap;

  return (
    <section className="section-space" id="coding-activity">
      <div className="container-page">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-sm text-cyan-400">
              {"// consistency matters"}
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              Coding Activity
            </h2>
            <p className="muted mt-2">
              My coding progress, connected to GitHub and LeetCode.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Updating..." : "Refresh"}
          </button>
        </div>

        {errors.length > 0 && (
          <div
            role="status"
            className="mb-5 rounded-xl border p-4 text-sm"
            style={{ borderColor: "var(--line)" }}
          >
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
            <p className="muted mt-1">
              Some providers may be temporarily unavailable. Previously
              loaded data is retained where possible.
            </p>
          </div>
        )}

        {loading && !data.github && !leetcode ? (
          <div className="card p-8 text-center">
            <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin" />
            <p className="muted">Loading live coding statistics...</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="card p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Github className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">GitHub</h3>
                    <p className="muted text-sm">
                      @{GITHUB_USERNAME}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://github.com/${GITHUB_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open GitHub profile"
                  className="muted hover:text-cyan-400"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>

              <div className="mb-5">
                <p className="muted text-sm">Contributions · last year</p>
                <p className="mt-1 text-3xl font-bold">
                  {data.github?.total?.lastYear?.toLocaleString() ?? "—"}
                </p>
              </div>

              <Heatmap contributions={githubContributions} />
            </article>

            <article className="card p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Code2 className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">LeetCode</h3>
                    <p className="muted text-sm">
                      @{LEETCODE_USERNAME}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://leetcode.com/u/${LEETCODE_USERNAME}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open LeetCode profile"
                  className="muted hover:text-cyan-400"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <Stat
                  label="Problems solved"
                  value={leetcode?.totalSolved ?? "—"}
                />
                <Stat
                  label="Acceptance rate"
                  value={
                    leetcode?.acceptanceRate != null
                      ? `${leetcode.acceptanceRate}%`
                      : "—"
                  }
                />
                <Stat
                  label="Easy"
                  value={leetcode?.byDifficulty?.easy ?? "—"}
                />
                <Stat
                  label="Medium"
                  value={leetcode?.byDifficulty?.medium ?? "—"}
                />
                <Stat
                  label="Hard"
                  value={leetcode?.byDifficulty?.hard ?? "—"}
                />
                <Stat
                  label="Active days"
                  value={heatmap?.totalActiveDays ?? "—"}
                />
              </div>

              <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <span>
                  Current streak:{" "}
                  <strong>{heatmap?.currentStreak ?? "—"}</strong>
                </span>
                <span>
                  Longest streak:{" "}
                  <strong>{heatmap?.longestStreak ?? "—"}</strong>
                </span>
              </div>

              <p className="mb-3 text-sm font-medium">
                Submission activity
              </p>
              <Heatmap contributions={heatmap?.dailyContributions ?? []} />
            </article>
          </div>
        )}

        <p className="muted mt-4 text-xs">
          {lastUpdated
            ? `Last checked: ${lastUpdated.toLocaleTimeString()} · Auto-refresh every 5 minutes`
            : "Statistics are fetched from public activity providers."}
        </p>
      </div>
    </section>
  );
}
