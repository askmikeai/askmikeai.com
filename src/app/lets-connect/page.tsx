"use client";

import { useState } from "react";

const FIELDS = [
  { name: "name", label: "Name", type: "text", required: true, placeholder: "Your name" },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "you@company.com" },
  { name: "company", label: "Company", type: "text", required: false, placeholder: "Where you work" },
  { name: "role", label: "Role", type: "text", required: false, placeholder: "Your title" },
  { name: "phone", label: "Phone / WhatsApp", type: "tel", required: false, placeholder: "+1 …" },
  { name: "source", label: "How we met / where you found me", type: "text", required: false, placeholder: "Event, X, a referral…" },
] as const;

const EMPTY = { name: "", email: "", company: "", role: "", phone: "", source: "", workingOn: "" };

export default function LetsConnectPage() {
  const [form, setForm] = useState({ ...EMPTY });
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
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't save your details.");
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} You can also email me at askmikeai@gmail.com.`
          : "Something went wrong. Please email me at askmikeai@gmail.com."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-ocean-800 py-20">
        <div className="absolute top-16 right-16 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl"></div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 font-semibold uppercase tracking-wide text-teal-200">Let&apos;s Connect</p>
          <h1 className="text-4xl font-display tracking-wide text-white sm:text-5xl">
            STAY IN TOUCH
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-teal-100">
            Builder, founder, or just AI-curious? Drop your details and I&apos;ll keep you in the loop —
            and reach out when there&apos;s something worth your time.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="rounded-3xl border border-teal-200 bg-teal-50 p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-teal-800">You&apos;re in. 🤝</h2>
              <p className="mt-2 text-teal-700">
                Thanks for connecting — I&apos;ve got your details and I&apos;ll be in touch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <div key={f.name} className={f.name === "source" ? "sm:col-span-2" : ""}>
                    <label htmlFor={f.name} className="block text-sm font-medium text-gray-700">
                      {f.label}
                      {!f.required && <span className="ml-1 text-gray-400">(optional)</span>}
                    </label>
                    <input
                      id={f.name}
                      name={f.name}
                      type={f.type}
                      required={f.required}
                      value={form[f.name as keyof typeof form]}
                      onChange={(e) => set(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="workingOn" className="block text-sm font-medium text-gray-700">
                  What are you working on? <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="workingOn"
                  name="workingOn"
                  rows={3}
                  value={form.workingOn}
                  onChange={(e) => set("workingOn", e.target.value)}
                  placeholder="A line or two on what you're building or where we might help each other."
                  className="mt-1.5 w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {error && <p className="text-sm text-coral-600">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-ocean-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {sending ? "Connecting…" : "Let's connect"}
              </button>
              <p className="text-center text-xs text-gray-500">
                No spam. I&apos;ll only reach out when it&apos;s genuinely worth it.
              </p>
            </form>
          )}

          {/* WhatsApp QR */}
          <div className="mt-10 flex flex-col items-center text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Rather just text?</p>
            <a
              href="https://wa.me/17542959900"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/whatsapp-qr.svg" alt="Scan to message Mike on WhatsApp" width={176} height={176} className="h-44 w-44" />
            </a>
            <p className="mt-3 text-sm text-gray-600">
              Scan to WhatsApp me ·{" "}
              <a href="https://wa.me/17542959900" className="font-medium text-teal-600 hover:text-teal-700">
                +1 (754) 295-9900
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
