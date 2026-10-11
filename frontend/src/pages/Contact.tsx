import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FieldError, SectionHeading } from "../components/ui";
import { useProfile } from "../hooks/useProfile";
import { useSeo } from "../hooks/useSeo";
import { api, toFriendlyError } from "../services/api";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().min(1, "Please enter your email").email("Enter a valid email address").max(254),
  subject: z.string().trim().min(1, "Please add a subject").max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  website: z.string().max(200).optional(), // honeypot
});
export type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  useSeo("Contact", "Get in touch about jobs, internships or freelance work.");
  const profile = useProfile();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactForm) {
    setServerError(null);
    try {
      await api.contact(values);
      setDone(true);
      reset();
    } catch (e) {
      const f = toFriendlyError(e);
      Object.entries(f.fieldErrors ?? {}).forEach(([k, m]) => setError(k as keyof ContactForm, { message: m }));
      setServerError(f.status === 429 ? "You've sent several messages recently. Please try again later." : f.message);
    }
  }

  return (
    <div className="container-page max-w-2xl py-12">
      <SectionHeading eyebrow="Contact" title="Let's talk" intro="Hiring, an internship, or a freelance project? Send a message and I'll get back to you." />
      {done ? (
        <div role="status" className="card flex flex-col items-center gap-3 p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden /><h2 className="text-xl font-semibold">Message sent</h2>
          <p className="muted">Thanks for reaching out. I'll reply by email.</p>
          <button className="btn-ghost" onClick={() => setDone(false)}>Send another</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-4 p-6" aria-label="Contact form">
          {serverError && <p role="alert" className="rounded-lg border border-red-400/40 p-3 text-sm text-red-300">{serverError}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="name">Name</label><input id="name" className="input" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} /><FieldError message={errors.name?.message} /></div>
            <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="input" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} /><FieldError message={errors.email?.message} /></div>
          </div>
          <div><label className="label" htmlFor="subject">Subject</label><input id="subject" className="input" aria-invalid={!!errors.subject} {...register("subject")} /><FieldError message={errors.subject?.message} /></div>
          <div><label className="label" htmlFor="message">Message</label><textarea id="message" rows={6} className="input" aria-invalid={!!errors.message} {...register("message")} /><FieldError message={errors.message?.message} /></div>
          <div aria-hidden className="absolute -left-[9999px]"><label htmlFor="website">Leave this empty</label><input id="website" tabIndex={-1} autoComplete="off" {...register("website")} /></div>
          <p className="muted text-xs">Your details are used only to reply to you. See the privacy notice. {profile?.email && <>Prefer email? <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a></>}</p>
          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />} {isSubmitting ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
}
