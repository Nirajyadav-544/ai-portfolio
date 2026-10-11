
import { useEffect, useState } from "react";

export type ToastType = "success" | "error";

type ToastProps = {
  message: string | null;
  type?: ToastType;
};

export default function Toast({
  message,
  type = "success",
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message || !visible) return null;

  const isSuccess = type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      className={`fixed right-5 top-5 z-[9999] flex max-w-sm items-center gap-3 rounded-xl border px-5 py-4 shadow-2xl ${
        isSuccess
          ? "border-emerald-500/40 bg-slate-900 text-white"
          : "border-red-500/40 bg-slate-900 text-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg ${
          isSuccess
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {isSuccess ? "✓" : "!"}
      </span>

      <p className="flex-1 text-sm font-medium">{message}</p>

      <button
        type="button"
        onClick={() => setVisible(false)}
        className="ml-2 text-xl text-slate-400 hover:text-white"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
