
import { FormEvent, useEffect, useState } from "react";
import { ErrorState, FieldError, Spinner } from "../../components/ui";
import Toast, { type ToastType } from "../../components/Toast";
import { useAsync } from "../../hooks/useAsync";
import { api, toFriendlyError } from "../../services/api";
import { linesToList } from "../../utils/format";

const TEXT = [
  "fullName",
  "title",
  "headline",
  "location",
  "availabilityMessage",
  "email",
  "githubUsername",
  "githubUrl",
  "linkedinUrl",
  "twitterUrl",
  "websiteUrl",
  "resumeUrl",
  "avatarUrl",
] as const;

const LABELS: Record<string, string> = {
  fullName: "Full name",
  title: "Title",
  headline: "Headline",
  location: "Location",
  availabilityMessage: "Availability message",
  email: "Public email",
  githubUsername: "GitHub username",
  githubUrl: "GitHub URL",
  linkedinUrl: "LinkedIn URL",
  twitterUrl: "Twitter/X URL",
  websiteUrl: "Website URL",
  resumeUrl: "Resume URL (PDF link or /path)",
  avatarUrl: "Avatar URL",
};

const AREAS = [
  ["bio", "Biography"],
  ["careerGoals", "Career goals"],
  ["philosophy", "Development philosophy"],
] as const;

type ToastState = {
  id: number;
  message: string;
  type: ToastType;
};

export default function ProfileEditor() {
  const { data, loading, error, reload } = useAsync(
    () => api.profile(),
    []
  );

  const [f, setF] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!data) return;

    const next: Record<string, string> = {
      availabilityStatus: data.availabilityStatus,
      interests: data.interests.join("\n"),
      roles: data.roles.join("\n"),
    };

    for (const k of TEXT) {
      next[k] = (data[k] as string | null) ?? "";
    }

    for (const [k] of AREAS) {
      next[k] = (data[k] as string | null) ?? "";
    }

    setF(next);
  }, [data]);

  const set = (k: string, v: string) => {
    setF((p) => ({ ...p, [k]: v }));
  };

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;

    setBusy(true);
    setMsg(null);
    setErrors({});
    setToast(null);

    try {
      await api.admin.updateProfile({
        ...f,
        interests: linesToList(f.interests ?? ""),
        roles: linesToList(f.roles ?? ""),
      });

      setToast({
        id: Date.now(),
        message: "Profile saved successfully!",
        type: "success",
      });

      reload();
    } catch (err) {
      const x = toFriendlyError(err);

      setErrors(x.fieldErrors ?? {});
      setMsg(x.message);

      setToast({
        id: Date.now(),
        message: x.message || "Failed to save profile.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) return <Spinner />;

  if (error) {
    return <ErrorState error={error} onRetry={reload} />;
  }

  return (
    <form onSubmit={save} className="space-y-4" noValidate>
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
        />
      )}

      <h1 className="text-2xl font-bold">Profile &amp; links</h1>

      {msg && (
        <p role="alert" className="chip">
          {msg}
        </p>
      )}

      <div className="card grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="p-av">
            Availability
          </label>

          <select
            id="p-av"
            className="input"
            value={f.availabilityStatus ?? ""}
            onChange={(e) =>
              set("availabilityStatus", e.target.value)
            }
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="OPEN_TO_OFFERS">OPEN_TO_OFFERS</option>
            <option value="BUSY">BUSY</option>
          </select>

          <FieldError message={errors.availabilityStatus} />
        </div>

        {TEXT.map((k) => (
          <div key={k}>
            <label className="label" htmlFor={`p-${k}`}>
              {LABELS[k]}
            </label>

            <input
              id={`p-${k}`}
              className="input"
              value={f[k] ?? ""}
              onChange={(e) => set(k, e.target.value)}
            />

            <FieldError message={errors[k]} />
          </div>
        ))}

        {AREAS.map(([k, label]) => (
          <div key={k} className="sm:col-span-2">
            <label className="label" htmlFor={`p-${k}`}>
              {label}
            </label>

            <textarea
              id={`p-${k}`}
              rows={5}
              className="input"
              value={f[k] ?? ""}
              onChange={(e) => set(k, e.target.value)}
            />

            <FieldError message={errors[k]} />
          </div>
        ))}

        <div>
          <label className="label" htmlFor="p-roles">
            Hero roles (one per line)
          </label>

          <textarea
            id="p-roles"
            rows={4}
            className="input"
            value={f.roles ?? ""}
            onChange={(e) => set("roles", e.target.value)}
          />

          <FieldError message={errors.roles} />
        </div>

        <div>
          <label className="label" htmlFor="p-int">
            Interests (one per line)
          </label>

          <textarea
            id="p-int"
            rows={4}
            className="input"
            value={f.interests ?? ""}
            onChange={(e) => set("interests", e.target.value)}
          />

          <FieldError message={errors.interests} />
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={busy}
      >
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
