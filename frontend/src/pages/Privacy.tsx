
import { ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeading } from "../components/ui";
import { useSeo } from "../hooks/useSeo";

export default function Privacy() {
  useSeo("Privacy policy");

  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="container-page max-w-3xl py-12">
      {/* Navigation buttons */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className="btn-ghost inline-flex items-center gap-2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={goHome}
          className="btn-ghost !p-2"
          aria-label="Close privacy policy and go home"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <SectionHeading eyebrow="Legal" title="Privacy policy" />

      <div className="muted space-y-4">
        <p>
          This site collects as little data as possible. This is a template
          notice: review it and adjust it to your situation before relying on it.
        </p>

        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--fg)" }}
        >
          Contact form
        </h2>
        <p>
          Name, email, subject and message are stored in the site's database
          so the owner can reply. They are not sold or shared.
        </p>

        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--fg)" }}
        >
          Analytics
        </h2>
        <p>
          Anonymous counts of page views, project views, resume downloads,
          contact submissions and AI assistant use. No IP addresses, cookies,
          user agents or personal identifiers are stored, only the referring
          website's host name. Events are deleted after a configurable
          retention period (90 days by default).
        </p>

        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--fg)" }}
        >
          AI assistant
        </h2>
        <p>
          Questions you type are sent to an AI provider to generate an answer.
          Conversations are not stored by this site. Please do not enter
          sensitive personal information.
        </p>

        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--fg)" }}
        >
          Local storage
        </h2>
        <p>
          Your light/dark theme choice is saved in your browser.
          Administrators receive a secure, HttpOnly session cookie.
        </p>
      </div>
    </div>
  );
}
