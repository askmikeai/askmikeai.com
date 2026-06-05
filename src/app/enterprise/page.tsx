"use client";

import { useState } from "react";
import Link from "next/link";

const READINESS = [
  { title: "Security review", body: "I'll complete your security questionnaire and share how data is handled, stored, and isolated." },
  { title: "MSA & DPA", body: "Master Services Agreement and Data Processing Addendum available for legal review and redlines." },
  { title: "SLA & support", body: "Defined uptime target and a named point of contact — me — for support and escalations." },
  { title: "Data handling", body: "Encryption in transit and at rest; clear retention and deletion; least-privilege access." },
  { title: "Access & SSO", body: "Role-based access; SSO/SAML on the roadmap for larger deployments." },
  { title: "Procurement-friendly", body: "Annual licensing on a Stripe invoice — PO numbers, net-30, ACH or wire. No card required." },
];

const STEPS = [
  { n: "01", t: "Request access", d: "Tell me the problem and your environment. I qualify the fit." },
  { n: "02", t: "Quote + paperwork", d: "I send a quote; we run MSA/DPA and your security review in parallel." },
  { n: "03", t: "PO + invoice", d: "You issue a PO; I invoice annually (net-30, ACH/wire)." },
  { n: "04", t: "Build & deploy", d: "I build, deploy, and support it — with a named owner accountable to you." },
];

export default function EnterprisePage() {
  const [form, setForm] = useState({
    name: "",
    workEmail: "",
    company: "",
    role: "",
    teamSize: "",
    timeline: "",
    useCase: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/enterprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't submit your request.");
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} You can also email askmikeai@gmail.com.`
          : "Something went wrong. Email askmikeai@gmail.com."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-900 py-24">
        <div className="absolute top-16 right-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-pink-600/10 blur-3xl"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 font-semibold uppercase tracking-wide text-teal-400">For teams</p>
            <h1 className="text-5xl font-display tracking-wide text-white sm:text-6xl">
              AI YOUR SECURITY &amp; LEGAL TEAMS CAN SIGN OFF ON
            </h1>
            <p className="mt-6 text-xl text-gray-300">
              Production AI software, built for one painful workflow and licensed annually. Procurement-
              ready paperwork, real security answers, and a named owner accountable for delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#request"
                className="rounded-full bg-gradient-to-r from-pink-600 to-coral-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:scale-105"
              >
                Request access
              </a>
              <Link
                href="/trust"
                className="rounded-full border border-white/20 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
              >
                Security &amp; trust
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">Custom annual licensing — pricing shared on a qualified call.</p>
          </div>
        </div>
      </section>

      {/* Why me */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-pink-600 font-semibold tracking-wide uppercase">Why me</p>
          <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
            BUILT BY SOMEONE WHO SHIPS AI IN PRODUCTION
          </h2>
          <div className="mt-6 space-y-4 text-lg text-gray-700">
            <p>
              I&apos;m a <strong>Principal Software Engineer at a Fortune&nbsp;100 enterprise-software
              company</strong>, where I build the AI harnesses my org runs on and train engineers to use
              AI in production. This isn&apos;t theory — it&apos;s the day job.
            </p>
            <p>
              I also teach what I learn to thousands of engineers. The point isn&apos;t content; it&apos;s
              that I translate frontier AI into software that survives real environments, real reviews, and
              real users.
            </p>
            <p className="text-base text-gray-500">
              AskMikeAI is my own independent venture — not affiliated with, sponsored by, or endorsed by
              my employer.
            </p>
          </div>
        </div>
      </section>

      {/* Procurement & legal readiness */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-teal-600 font-semibold tracking-wide uppercase">Procurement &amp; legal</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              READY FOR REVIEW
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              The things your security, legal, and procurement teams ask for — handled.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {READINESS.map((r) => (
              <div key={r.title} className="rounded-3xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-bold text-gray-900">{r.title}</h3>
                <p className="mt-2 text-gray-600">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            Full details on the{" "}
            <Link href="/trust" className="font-semibold text-teal-600 hover:text-teal-700">
              security &amp; trust page
            </Link>
            . Send security questionnaires to askmikeai@gmail.com.
          </p>
        </div>
      </section>

      {/* How buying works */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-pink-600 font-semibold tracking-wide uppercase">How buying works</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              NO SURPRISES
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-ocean-600 shadow-xl">
                  <span className="text-2xl font-display text-white">{s.n}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{s.t}</h3>
                <p className="mt-2 text-gray-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request access form */}
      <section id="request" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-teal-600 font-semibold tracking-wide uppercase">Talk to sales</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              REQUEST ACCESS
            </h2>
            <p className="mt-4 text-gray-600">
              Tell me about the workflow and your environment. I&apos;ll reply with fit and a quote.
            </p>
          </div>

          {submitted ? (
            <div className="mt-10 rounded-3xl border border-teal-200 bg-teal-50 p-10 text-center">
              <h3 className="text-2xl font-bold text-teal-800">Got it. 🤝</h3>
              <p className="mt-2 text-teal-700">
                Thanks — I&apos;ll review and get back to you with next steps, usually within 2 business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field id="name" label="Name" required value={form.name} onChange={(v) => set("name", v)} />
                <Field id="workEmail" label="Work email" type="email" required value={form.workEmail} onChange={(v) => set("workEmail", v)} />
                <Field id="company" label="Company" required value={form.company} onChange={(v) => set("company", v)} />
                <Field id="role" label="Role" value={form.role} onChange={(v) => set("role", v)} />
                <Field id="teamSize" label="Team size" placeholder="e.g. 50–200" value={form.teamSize} onChange={(v) => set("teamSize", v)} />
                <Field id="timeline" label="Timeline" placeholder="e.g. this quarter" value={form.timeline} onChange={(v) => set("timeline", v)} />
              </div>
              <div>
                <label htmlFor="useCase" className="block text-sm font-medium text-gray-700">
                  What workflow should this solve? <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="useCase"
                  rows={3}
                  value={form.useCase}
                  onChange={(e) => set("useCase", e.target.value)}
                  placeholder="The painful, recurring workflow you'd license software to fix."
                  className="mt-1.5 w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Procurement / security notes <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Anything we should know up front (security review process, budget cycle, etc.)."
                  className="mt-1.5 w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {error && <p className="text-sm text-coral-600">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-coral-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {sending ? "Sending…" : "Request access"}
              </button>
              <p className="text-center text-xs text-gray-500">
                I reply personally. Prefer to talk? Email askmikeai@gmail.com.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {!required && <span className="ml-1 text-gray-400">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      />
    </div>
  );
}
