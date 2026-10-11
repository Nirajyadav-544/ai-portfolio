
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

type Mode = "login" | "request" | "verify" | "newPassword";

async function postJson(
  url: string,
  body: Record<string, string>
): Promise<{ message?: string; resetToken?: string }> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed. Please try again.");
  }

  return data;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch {
      setError("Sign-in failed. Check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const result = await postJson(
        "/api/auth/password-reset/request",
        { email: email.trim() }
      );

      setNotice(
        result.message ||
          "If an eligible account exists, a verification code will be sent."
      );
      setOtp("");
      setMode("verify");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to request an OTP."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setBusy(true);

    try {
      const result = await postJson(
        "/api/auth/password-reset/verify-otp",
        {
          email: email.trim(),
          otp,
        }
      );

      if (!result.resetToken) {
        throw new Error("Verification response did not include a reset token.");
      }

      setResetToken(result.resetToken);
      setNewPassword("");
      setConfirmPassword("");
      setNotice("OTP verified. You can now create a new password.");
      setMode("newPassword");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "OTP verification failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!resetToken) {
      setError("Please verify your OTP first.");
      setMode("verify");
      return;
    }

    if (newPassword.length < 12 || newPassword.length > 72) {
      setError("Your new password must contain 12–72 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const result = await postJson(
        "/api/auth/password-reset/confirm",
        {
          resetToken,
          newPassword,
        }
      );

      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
      setNotice(
        result.message ||
          "Password changed. Sign in with your new password."
      );
      setMode("login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change the password."
      );
    } finally {
      setBusy(false);
    }
  }

  function switchMode(nextMode: Mode) {
    setError("");
    setNotice("");

    if (nextMode === "request" || nextMode === "login") {
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
    }

    setMode(nextMode);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to portfolio
        </Link>

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
          {mode === "login" ? (
            <Lock size={24} />
          ) : mode === "request" ? (
            <Mail size={24} />
          ) : mode === "verify" ? (
            <ShieldCheck size={24} />
          ) : (
            <KeyRound size={24} />
          )}
        </div>

        <h1 className="text-2xl font-bold">
          {mode === "login"
            ? "Admin sign in"
            : mode === "request"
            ? "Forgot password?"
            : mode === "verify"
            ? "Verify OTP"
            : "Create New Password"}
        </h1>

        <p className="mt-2 mb-6 text-sm leading-6 text-slate-400">
          {mode === "login"
            ? "Sign in to manage your portfolio."
            : mode === "request"
            ? "Enter your registered email to request a verification code."
            : mode === "verify"
            ? "Enter the 6-digit code sent to your email. Password fields will appear after successful verification."
            : "Your email verification is complete. Choose a new password."}
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300"
          >
            {notice}
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm">
              Email
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-400"
                placeholder="you@example.com"
              />
            </label>

            <label className="block text-sm">
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-400"
                placeholder="Enter your password"
              />
            </label>

            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode("request")}
                className="text-sm text-indigo-300 hover:text-indigo-200"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-60"
            >
              {busy && <Loader2 size={18} className="animate-spin" />}
              Sign in
            </button>
          </form>
        )}

        {mode === "request" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <label className="block text-sm">
              Registered email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-400"
                placeholder="you@example.com"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-60"
            >
              {busy && <Loader2 size={18} className="animate-spin" />}
              Send verification code
            </button>

            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full text-sm text-slate-400 hover:text-white"
            >
              Back to sign in
            </button>
          </form>
        )}

        {mode === "verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <label className="block text-sm">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-400"
              />
            </label>

            <label className="block text-sm">
              6-digit OTP
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-center text-xl tracking-[0.4em] outline-none focus:border-indigo-400"
                placeholder="000000"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-60"
            >
              {busy && <Loader2 size={18} className="animate-spin" />}
              Verify OTP
            </button>

            <button
              type="button"
              onClick={() => switchMode("request")}
              className="w-full text-sm text-slate-400 hover:text-white"
            >
              Request a new code
            </button>
          </form>
        )}

        {mode === "newPassword" && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <label className="block text-sm">
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-400"
                placeholder="At least 12 characters"
              />
            </label>

            <label className="block text-sm">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-400"
                placeholder="Repeat your new password"
              />
            </label>

            <button
              type="submit"
              disabled={busy || !resetToken}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-60"
            >
              {busy && <Loader2 size={18} className="animate-spin" />}
              Reset Password
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
