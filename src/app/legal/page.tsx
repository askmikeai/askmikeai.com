import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal - AskMikeAI",
  description: "Terms of service, master services agreement, and privacy / data processing for AskMikeAI.",
  alternates: { canonical: "/legal" },
  openGraph: {
    title: "Legal — AskMikeAI",
    description: "Terms, MSA, and privacy / DPA.",
    url: "/legal",
  },
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gray-900 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 font-semibold uppercase tracking-wide text-teal-400">Legal</p>
          <h1 className="text-4xl font-display tracking-wide text-white sm:text-5xl">TERMS &amp; PRIVACY</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <strong>Draft templates.</strong> The summaries below are starting points and are{" "}
            <strong>not yet reviewed by counsel</strong>. The binding terms for an engagement are the
            executed agreement (MSA/DPA) you sign. For the current documents, email askmikeai@gmail.com.
          </div>

          <div className="prose prose-lg mt-10 max-w-none text-gray-700">
            <h2 className="text-2xl font-bold text-gray-900">Terms of Service (summary)</h2>
            <p>
              AskMikeAI provides AI software under a license. For self-serve plans, you set a monthly price
              and license the software Mike builds and owns; you may cancel anytime via Stripe. For
              enterprise, the executed Master Services Agreement governs.
            </p>

            <h2 className="mt-10 text-2xl font-bold text-gray-900">Master Services Agreement (enterprise)</h2>
            <p>
              Annual licensing, scope, support, SLA, fees, and liability are set in the MSA. Available for
              your legal team&apos;s review and redlines during procurement. [Document to be finalized with
              counsel.]
            </p>

            <h2 className="mt-10 text-2xl font-bold text-gray-900">Privacy &amp; Data Processing (summary)</h2>
            <p>
              We collect only what&apos;s needed to deliver the service (e.g., your contact details and the
              problem you describe). We don&apos;t sell your data. Subprocessors are listed on the{" "}
              <Link href="/trust" className="text-teal-600 underline">Security &amp; Trust</Link> page. A
              Data Processing Addendum (DPA) is available for enterprise. [DPA to be finalized with counsel.]
            </p>
          </div>

          <div className="mt-12">
            <Link href="/trust" className="rounded-full bg-gradient-to-r from-pink-600 to-coral-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105">
              Security &amp; Trust
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
