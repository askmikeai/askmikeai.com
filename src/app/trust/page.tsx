import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security & Trust - AskMikeAI",
  description:
    "How AskMikeAI handles data and security: encryption, access control, subprocessors, DPA/MSA, SLA, and our compliance roadmap.",
  alternates: { canonical: "/trust" },
  openGraph: {
    title: "Security & Trust — AskMikeAI",
    description: "Data handling, subprocessors, DPA/MSA, SLA, and compliance roadmap.",
    url: "/trust",
  },
};

const SUBPROCESSORS = [
  { name: "Vercel", purpose: "Application hosting & delivery (US regions)" },
  { name: "Neon", purpose: "Managed Postgres database" },
  { name: "Stripe", purpose: "Payments & billing (PCI-compliant)" },
  { name: "Resend", purpose: "Transactional email" },
  { name: "Ollama Cloud", purpose: "Hosted LLM inference for the AI assistant" },
];

const PRACTICES = [
  { t: "Encryption", d: "Data is encrypted in transit (TLS) and at rest by our hosting and database providers." },
  { t: "Access control", d: "Least-privilege access; production secrets stored in the platform's secret manager, not in code." },
  { t: "Data retention", d: "We retain only what's needed to deliver the service and honor deletion requests. [Specifics to be finalized.]" },
  { t: "Incident response", d: "Security issues are triaged promptly; affected customers are notified. Report to askmikeai@gmail.com." },
  { t: "Availability", d: "Target uptime and a named point of contact are defined in your SLA. [Target to be finalized.]" },
  { t: "Data ownership", d: "Your data is yours. It's used to deliver and improve your tool — never sold." },
];

export default function TrustPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gray-900 py-20">
        <div className="absolute top-10 right-20 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl"></div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 font-semibold uppercase tracking-wide text-teal-400">Security &amp; Trust</p>
          <h1 className="text-4xl font-display tracking-wide text-white sm:text-5xl">
            HOW YOUR DATA IS HANDLED
          </h1>
          <p className="mt-5 text-lg text-gray-300">
            A plain-language overview for your security and procurement teams. Sending a questionnaire?
            Email <a href="mailto:askmikeai@gmail.com" className="text-teal-300 underline">askmikeai@gmail.com</a>.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PRACTICES.map((p) => (
              <div key={p.t} className="rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900">{p.t}</h3>
                <p className="mt-2 text-gray-600">{p.d}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-16 text-2xl font-bold text-gray-900">Subprocessors</h2>
          <p className="mt-2 text-gray-600">The vendors that help deliver the service.</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {SUBPROCESSORS.map((s) => (
                  <tr key={s.name}>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3">{s.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="font-bold text-amber-900">Compliance roadmap</h3>
            <p className="mt-1 text-sm text-amber-800">
              SOC 2 is <strong>in progress</strong>. We don&apos;t claim certifications we don&apos;t hold.
              For your specific requirements (DPA, data residency, retention windows, pen-test summaries),
              reach out and we&apos;ll work through them.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="/enterprise" className="rounded-full bg-gradient-to-r from-pink-600 to-coral-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105">
              Enterprise overview
            </Link>
            <Link href="/legal" className="rounded-full border border-gray-300 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-50">
              Legal &amp; terms
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
